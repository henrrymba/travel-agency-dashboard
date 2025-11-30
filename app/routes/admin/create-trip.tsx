import { Header } from "../../../components";
import { ComboBoxComponent } from "@syncfusion/ej2-react-dropdowns";
import type { Route } from "./+types/create-trip";
import { comboBoxItems, selectItems } from "~/constants";
import { cn, formatKey } from "~/lib/utils";
import {
  LayerDirective,
  LayersDirective,
  MapsComponent,
} from "@syncfusion/ej2-react-maps";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { world_map } from "~/constants/world_map";
import { ButtonComponent } from "@syncfusion/ej2-react-buttons";
import { account } from "~/appwrite/client";
import { useNavigate } from "react-router";

export const loader = async () => {
  const response = await fetch(
    "https://restcountries.com/v3.1/all?fields=name,latlng,flag,maps"
  );
  const data = await response.json();

  if (!response.ok || !Array.isArray(data)) {
    console.error(
      "Failed to fetch country data or data is not an array:",
      data
    );
    return [];
  }

  return data.map((country: any) => ({
    name: country.flag + " " + country.name.common,
    coordinates: country.latlng,
    value: country.name.common,
    openStreetMap: country.maps?.openStreetMap,
  }));
};

const CreateTrip = ({ loaderData }: Route.ComponentProps) => {
  const { t, i18n } = useTranslation();
  const countries = loaderData as Country[];
  const navigate = useNavigate();

  const [formData, setFormData] = useState<TripFormData>({
    country: countries[0]?.name || "",
    travelStyle: "",
    interest: "",
    budget: "",
    duration: 0,
    groupType: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    if (
      !formData.country ||
      !formData.travelStyle ||
      !formData.interest ||
      !formData.budget ||
      !formData.groupType
    ) {
      setError(t("trips.create.errors.allFields"));
      setLoading(false);
      return;
    }

    if (formData.duration < 1 || formData.duration > 10) {
      if (formData.duration < 1 || formData.duration > 10) {
        setError(t("trips.create.errors.durationRange"));
        setLoading(false);
        return;
      }
      setLoading(false);
      return;
    }
    const user = await account.get();
    if (!user.$id) {
      console.error("User not authenticated");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/create-trip", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          country: formData.country,
          numberOfDays: formData.duration,
          travelStyle: formData.travelStyle,
          interests: formData.interest,
          budget: formData.budget,
          groupType: formData.groupType,
          userId: user.$id,
          language: i18n.language,
        }),
      });

      const result: CreateTripResponse = await response.json();

      if (result?.id) navigate(`/trips/${result.id}`);
      else console.error("Failed to generate a trip");
    } catch (e) {
      console.error("Error generating trip", e);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (key: keyof TripFormData, value: string | number) => {
    setFormData({ ...formData, [key]: value });
  };
  const countryData = countries.map((country) => ({
    text: country.name,
    value: country.value,
  }));

  const mapData = [
    {
      country: formData.country,
      color: "#EA382E",
      coordinates:
        countries.find((c: Country) => c.name === formData.country)
          ?.coordinates || [],
    },
  ];

  return (
    <main className="flex flex-col gap-10 pb-20 wrapper">
      <Header
        title={t("trips.create.title")}
        description={t("trips.create.description")}
      />

      <section className="mt-2.5 wrapper-md">
        <form className="trip-form" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="country">{t("trips.create.form.country")}</label>
            <ComboBoxComponent
              id="country"
              dataSource={countryData}
              fields={{ text: "text", value: "value" }}
              placeholder={t("trips.create.form.selectCountry")}
              className="combo-box"
              change={(e: { value: string | undefined }) => {
                if (e.value) {
                  handleChange("country", e.value);
                }
              }}
              allowFiltering
              filtering={(e) => {
                const query = e.text.toLowerCase();

                e.updateData(
                  countries
                    .filter((country) =>
                      country.name.toLowerCase().includes(query)
                    )
                    .map((country) => ({
                      text: country.name,
                      value: country.value,
                    }))
                );
              }}
            />
          </div>

          <div>
            <label htmlFor="duration">{t("trips.create.form.duration")}</label>
            <input
              id="duration"
              name="duration"
              type="number"
              placeholder={t("trips.create.form.enterDuration")}
              className="form-input placeholder:text-gray-100"
              onChange={(e) => handleChange("duration", Number(e.target.value))}
            />
          </div>

          {selectItems.map((key) => (
            <div key={key}>
              <label htmlFor={key}>{t(`trips.create.form.${key}`)}</label>

              <ComboBoxComponent
                id={key}
                dataSource={comboBoxItems[key].map((item) => {
                  // Determine the translation key category based on the field key
                  let category = "";
                  if (key === "travelStyle") category = "travelStyles";
                  else if (key === "interest") category = "interests";
                  else if (key === "budget") category = "budget";
                  else if (key === "groupType") category = "groupType";

                  const translatedText = t(
                    `trips.create.options.${category}.${item}`
                  );
                  return {
                    text: translatedText,
                    value: translatedText,
                  };
                })}
                fields={{ text: "text", value: "value" }}
                placeholder={`${t(`trips.create.form.select${key.charAt(0).toUpperCase() + key.slice(1)}`)}`}
                change={(e: { value: string | undefined }) => {
                  if (e.value) {
                    handleChange(key, e.value);
                  }
                }}
                allowFiltering
                filtering={(e) => {
                  const query = e.text.toLowerCase();

                  // Determine the translation key category based on the field key
                  let category = "";
                  if (key === "travelStyle") category = "travelStyles";
                  else if (key === "interest") category = "interests";
                  else if (key === "budget") category = "budget";
                  else if (key === "groupType") category = "groupType";

                  e.updateData(
                    comboBoxItems[key]
                      .map((item) => {
                        const translatedText = t(
                          `trips.create.options.${category}.${item}`
                        );
                        return {
                          text: translatedText,
                          value: translatedText,
                        };
                      })
                      .filter((item) => item.text.toLowerCase().includes(query))
                  );
                }}
                className="combo-box"
              />
            </div>
          ))}

          <div>
            <label htmlFor="location">
              {t("trips.create.form.locationMap")}
            </label>
            <MapsComponent>
              <LayersDirective>
                <LayerDirective
                  shapeData={world_map}
                  dataSource={mapData}
                  shapePropertyPath="name"
                  shapeDataPath="country"
                  shapeSettings={{ colorValuePath: "color", fill: "#E5E5E5" }}
                />
              </LayersDirective>
            </MapsComponent>
          </div>

          <div className="bg-gray-200 h-px w-full" />

          {error && (
            <div className="error">
              <p>{error}</p>
            </div>
          )}
          <footer className="px-6 w-full">
            <ButtonComponent
              type="submit"
              className="button-class !h-12 !w-full"
              disabled={loading}
            >
              <img
                src={`/assets/icons/${loading ? "loader.svg" : "magic-star.svg"}`}
                className={cn("size-5", { "animate-spin": loading })}
              />
              <span className="p-16-semibold text-white">
                {loading
                  ? t("trips.create.form.generating")
                  : t("trips.create.form.generate")}
              </span>
            </ButtonComponent>
          </footer>
        </form>
      </section>
    </main>
  );
};
export default CreateTrip;
