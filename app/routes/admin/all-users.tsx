import { Header } from "../../../components";
import { useTranslation } from "react-i18next";
import {
  ColumnsDirective,
  ColumnDirective,
  GridComponent,
} from "@syncfusion/ej2-react-grids";
import { cn, formatDate } from "~/lib/utils";
import { getAllUsers } from "~/appwrite/auth";
import type { Route } from "./+types/all-users";

export const loader = async () => {
  const { users, total } = await getAllUsers(10, 0);

  return { users, total };
};

const AllUsers = ({ loaderData }: Route.ComponentProps) => {
  const { t, i18n } = useTranslation();
  const { users } = loaderData;

  return (
    <main className="all-users wrapper">
      <Header
        title={t("allUsers.title")}
        description={t("allUsers.description")}
      />

      <GridComponent dataSource={users} gridLines="None" key={i18n.language}>
        <ColumnsDirective>
          <ColumnDirective
            field="name"
            headerText={t("allUsers.table.name")}
            width="200"
            textAlign="Left"
            template={(props: UserData) => (
              <div className="flex items-center gap-1.5 px-4">
                {props.imageUrl ? (
                  <img
                    src={props.imageUrl}
                    alt="user"
                    className="rounded-full size-8 aspect-square object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="size-8 rounded-full bg-primary-500 flex items-center justify-center text-white font-bold text-sm">
                    {props.name?.charAt(0).toUpperCase() || "U"}
                  </div>
                )}
                <span>{props.name}</span>
              </div>
            )}
          />
          <ColumnDirective
            field="email"
            headerText={t("allUsers.table.email")}
            width="200"
            textAlign="Left"
          />
          <ColumnDirective
            field="joinedAt"
            headerText={t("allUsers.table.dateJoined")}
            width="140"
            textAlign="Left"
            template={({ joinedAt }: { joinedAt: string }) =>
              formatDate(joinedAt)
            }
          />
          <ColumnDirective
            field="status"
            headerText={t("allUsers.table.type")}
            width="100"
            textAlign="Left"
            template={({ status }: UserData) => (
              <article
                className={cn(
                  "status-column",
                  status === "user" ? "bg-success-50" : "bg-light-300"
                )}
              >
                <div
                  className={cn(
                    "size-1.5 rounded-full",
                    status === "user" ? "bg-success-500" : "bg-gray-500"
                  )}
                />
                <h3
                  className={cn(
                    "font-inter text-xs font-medium",
                    status === "user" ? "text-success-700" : "text-gray-500"
                  )}
                >
                  {status}
                </h3>
              </article>
            )}
          />
        </ColumnsDirective>
      </GridComponent>
    </main>
  );
};
export default AllUsers;
