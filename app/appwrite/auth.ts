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
    // Step 1: Create user in Appwrite Auth
    const newAccount = await account.create(ID.unique(), email, password, name);
    if (!newAccount) throw new Error("Failed to create account");

    // Step 2: Create user document in database
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
        imageUrl: "", // Optional, empty for now
      }
    );

    // Step 3: Create session (auto-login)
    await signIn(email, password);

    return newUser;
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
      // Ignore error if no session exists or if it fails to delete
      // console.log("No active session to delete or failed to delete");
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
      // Fallback if user exists in Auth but not in DB (shouldn't happen with correct flow)
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
    // console.error("Error getting current user:", error);
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
