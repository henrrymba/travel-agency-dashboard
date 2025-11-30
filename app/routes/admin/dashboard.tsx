import { Header, StatsCard, TripCard } from "../../../components";
import { getAllUsers, getCurrentUser } from "~/appwrite/auth";
import type { Route } from "./+types/dashboard";
import {
  getTripsByTravelStyle,
  getUserGrowthPerDay,
  getUsersAndTripsStats,
} from "~/appwrite/dashboard";
import { getAllTrips } from "~/appwrite/trips";
import { parseTripData } from "~/lib/utils";
import {
  Category,
  ChartComponent,
  ColumnSeries,
  DataLabel,
  SeriesCollectionDirective,
  SeriesDirective,
  SplineAreaSeries,
  Tooltip,
} from "@syncfusion/ej2-react-charts";
import {
  ColumnDirective,
  ColumnsDirective,
  GridComponent,
  Inject,
} from "@syncfusion/ej2-react-grids";
import { tripXAxis, tripyAxis, userXAxis, useryAxis } from "~/constants";
import { redirect } from "react-router";
import { useTranslation } from "react-i18next";

export const clientLoader = async () => {
  const [
    user,
    dashboardStats,
    trips,
    userGrowth,
    tripsByTravelStyle,
    allUsers,
  ] = await Promise.all([
    await getCurrentUser(),
    await getUsersAndTripsStats(),
    await getAllTrips(4, 0),
    await getUserGrowthPerDay(),
    await getTripsByTravelStyle(),
    await getAllUsers(4, 0),
  ]);

  const allTrips = trips.allTrips.map((trip: any) => ({
    id: trip.$id,
    ...parseTripData(trip.tripDetail),
    imageUrls: trip.imageUrls ?? [],
  }));

  const mappedUsers: UsersItineraryCount[] = allUsers.users.map(
    (user: any) => ({
      imageUrl: user.imageUrl,
      name: user.name,
      count: user.itineraryCount ?? Math.floor(Math.random() * 10),
    })
  );

  return {
    user,
    dashboardStats,
    allTrips,
    userGrowth,
    tripsByTravelStyle,
    allUsers: mappedUsers,
  };
};

const Dashboard = ({ loaderData }: Route.ComponentProps) => {
  const { t, i18n } = useTranslation();
  const user = loaderData.user as User | null;
  const { dashboardStats, allTrips, userGrowth, tripsByTravelStyle, allUsers } =
    loaderData;

  const trips = allTrips.map((trip: any) => ({
    imageUrl: trip.imageUrls[0],
    name: trip.name,
    interest: trip.interests,
  }));

  const usersAndTrips = [
    {
      title: t("dashboard.latestSignups"),
      dataSource: allUsers,
      field: "count",
      headerText: t("dashboard.tripsCreated"),
    },
    {
      title: t("dashboard.tripsByInterests"),
      dataSource: trips,
      field: "interest",
      headerText: t("dashboard.interests"),
    },
  ];

  return (
    <main className="dashboard wrapper">
      <Header
        title={t("dashboard.welcome", {
          name: user?.name ?? t("dashboard.guest"),
        })}
        description={t("dashboard.description")}
      />

      <section className="flex flex-col gap-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
          <StatsCard
            headerTitle={t("dashboard.stats.totalUsers")}
            total={dashboardStats.totalUsers}
            currentMonthCount={dashboardStats.usersJoined.currentMonth}
            lastMonthCount={dashboardStats.usersJoined.lastMonth}
          />
          <StatsCard
            headerTitle={t("dashboard.stats.totalTrips")}
            total={dashboardStats.totalTrips}
            currentMonthCount={dashboardStats.tripsCreated.currentMonth}
            lastMonthCount={dashboardStats.tripsCreated.lastMonth}
          />
          <StatsCard
            headerTitle={t("dashboard.stats.activeUsers")}
            total={dashboardStats.userRole.total}
            currentMonthCount={dashboardStats.userRole.currentMonth}
            lastMonthCount={dashboardStats.userRole.lastMonth}
          />
        </div>
      </section>
      <section className="container">
        <h1 className="text-xl font-semibold text-dark-100">
          {t("dashboard.createdTrips")}
        </h1>

        <div className="trip-grid">
          {allTrips.map((trip: any) => (
            <TripCard
              key={trip.id}
              id={trip.id.toString()}
              name={trip.name!}
              imageUrl={trip.imageUrls[0]}
              location={trip.itinerary?.[0]?.location ?? ""}
              tags={[trip.interests!, trip.travelStyle!]}
              price={trip.estimatedPrice!}
            />
          ))}
        </div>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <ChartComponent
          id="chart-1"
          primaryXAxis={{ ...userXAxis, title: t("dashboard.charts.day") }}
          primaryYAxis={{ ...useryAxis, title: t("dashboard.charts.count") }}
          title={t("dashboard.charts.userGrowth")}
          tooltip={{ enable: true }}
        >
          <Inject
            services={[
              ColumnSeries,
              SplineAreaSeries,
              Category,
              DataLabel,
              Tooltip,
            ]}
          />

          <SeriesCollectionDirective>
            <SeriesDirective
              dataSource={userGrowth}
              xName="day"
              yName="count"
              type="Column"
              name="Column"
              columnWidth={0.3}
              cornerRadius={{ topLeft: 10, topRight: 10 }}
            />

            <SeriesDirective
              dataSource={userGrowth}
              xName="day"
              yName="count"
              type="SplineArea"
              name="Wave"
              fill="rgba(71, 132, 238, 0.3)"
              border={{ width: 2, color: "#4784EE" }}
            />
          </SeriesCollectionDirective>
        </ChartComponent>

        <ChartComponent
          id="chart-2"
          primaryXAxis={{
            ...tripXAxis,
            title: t("dashboard.charts.travelStyles"),
          }}
          primaryYAxis={{ ...tripyAxis, title: t("dashboard.charts.count") }}
          title={t("dashboard.charts.tripTrends")}
          tooltip={{ enable: true }}
        >
          <Inject
            services={[
              ColumnSeries,
              SplineAreaSeries,
              Category,
              DataLabel,
              Tooltip,
            ]}
          />

          <SeriesCollectionDirective>
            <SeriesDirective
              dataSource={tripsByTravelStyle.map((item: any) => ({
                ...item,
                travelStyle: t(
                  `dashboard.travelStyles.${item.travelStyle}`,
                  item.travelStyle
                ),
              }))}
              xName="travelStyle"
              yName="count"
              type="Column"
              name="day"
              columnWidth={0.3}
              cornerRadius={{ topLeft: 10, topRight: 10 }}
            />
          </SeriesCollectionDirective>
        </ChartComponent>
      </section>

      <section className="user-trip wrapper">
        {usersAndTrips.map(({ title, dataSource, field, headerText }, i) => (
          <div key={i} className="flex flex-col gap-5">
            <h3 className="p-20-semibold text-dark-100">{title}</h3>

            <GridComponent
              dataSource={dataSource}
              gridLines="None"
              key={i18n.language}
            >
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
                  field={field}
                  headerText={headerText}
                  width="150"
                  textAlign="Left"
                />
              </ColumnsDirective>
            </GridComponent>
          </div>
        ))}
      </section>
    </main>
  );
};
export default Dashboard;
