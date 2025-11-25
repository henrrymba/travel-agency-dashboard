import { ID, Query } from "appwrite";
import { account, database, appwriteConfig } from "~/appwrite/client";

export type UserStatus = "admin" | "user";

export interface NewUser {
  name: string;
  email: string;
  password: string;
  status: UserStatus;
}

export const signUp = async ({ name, email, password, status }: NewUser) => {
  try {
    const newAccount = await account.create(ID.unique(), email, password, name);
    if (!newAccount) throw new Error("Failed to create account");

    await signIn(email, password);

    try {
      const newUser = await database.createDocument(
        appwriteConfig.databaseId,
        appwriteConfig.userCollectionId,
        ID.unique(),
        {
          accountId: newAccount.$id,
          email: email,
          name: name,
          joinedAt: new Date().toISOString(),
          status: status,
          imageUrl: "",
        }
      );
      return newUser;
    } catch (dbError) {
      console.error("Failed to create user document:", dbError);
      await account.deleteSession("current");
      throw dbError;
    }
  } catch (error) {
    console.error("Error in signUp:", error);
    throw error;
  }
};

export const signIn = async (email: string, password: string) => {
  try {
    // Ensure no active session exists before creating a new one
    try {
      await account.deleteSession("current");
    } catch (error) {
      console.log("No active session to delete or failed to delete");
    }

    return await account.createEmailPasswordSession(email, password);
  } catch (error) {
    console.error("Error in signIn:", error);
    throw error;
  }
};

export const signOut = async () => {
  try {
    await account.deleteSession("current");
  } catch (error) {
    console.error("Error in signOut:", error);
    throw error;
  }
};

export const getCurrentUser = async () => {
  try {
    const currentAccount = await account.get();
    if (!currentAccount) return null;

    const { documents } = await database.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      [Query.equal("accountId", currentAccount.$id)]
    );

    if (documents.length === 0) {
      return {
        $id: "",
        accountId: currentAccount.$id,
        name: currentAccount.name,
        email: currentAccount.email,
        status: "user", // Default
      };
    }

    return documents[0];
  } catch (error) {
    return null;
  }
};

export const getAllUsers = async (limit: number, offset: number) => {
  try {
    const { documents: users, total } = await database.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      [Query.limit(limit), Query.offset(offset)]
    );

    if (total === 0) return { users: [], total };

    return { users, total };
  } catch (e) {
    console.log("Error fetching users");
    return { users: [], total: 0 };
  }
};
