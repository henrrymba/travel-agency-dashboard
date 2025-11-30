import React, { useEffect } from "react";
import { Link, type LoaderFunctionArgs } from "react-router";
import { useTranslation } from "react-i18next";
import type { Route } from "./+types/payment-success";
import { ButtonComponent } from "@syncfusion/ej2-react-buttons";
import confetti from "canvas-confetti";
import { LEFT_CONFETTI, RIGHT_CONFETTI } from "~/constants";

export async function loader({ params }: LoaderFunctionArgs) {
  return params;
}

const PaymentSuccess = ({ loaderData }: Route.ComponentProps) => {
  const { t } = useTranslation();
  useEffect(() => {
    confetti(LEFT_CONFETTI);
    confetti(RIGHT_CONFETTI);
  }, []);

  return (
    <main className="payment-success wrapper">
      <section>
        <article>
          <img src="/assets/icons/check.svg" className="size-24" />
          <h1>{t("success.title")}</h1>

          <p>{t("success.message")}</p>

          <Link to={`/travel/${loaderData?.tripId}`} className="w-full">
            <ButtonComponent className="button-class !h-11 !w-full">
              <img
                src="/assets/icons/itinerary-button.svg"
                className="size-5"
              />

              <span className="p-16-semibold text-white">
                {t("success.viewDetails")}
              </span>
            </ButtonComponent>
          </Link>
          <Link to={"/"} className="w-full">
            <ButtonComponent className="button-class-secondary !h-11 !w-full">
              <img src="/assets/icons/arrow-left.svg" className="size-5" />

              <span className="p-16-semibold">{t("success.returnHome")}</span>
            </ButtonComponent>
          </Link>
        </article>
      </section>
    </main>
  );
};
export default PaymentSuccess;
