import { L10n } from "@syncfusion/ej2-base";

export const loadSyncfusionLocales = () => {
  L10n.load({
    es: {
      pager: {
        currentPageInfo: "{0} de {1} páginas",
        totalItemsInfo: "({0} artículos)",
        firstPageTooltip: "Ir a la primera página",
        lastPageTooltip: "Ir a la última página",
        nextPageTooltip: "Ir a la página siguiente",
        previousPageTooltip: "Ir a la página anterior",
        nextPagerTooltip: "Ir al siguiente paginador",
        previousPagerTooltip: "Ir al paginador anterior",
      },
      grid: {
        EmptyRecord: "No hay registros para mostrar",
        GroupDropArea:
          "Arrastre un encabezado de columna aquí para agrupar su columna",
        UnGroup: "Haga clic aquí para desagrupar",
        EmptyDataSourceError:
          "DataSource no debe estar vacío al cargar inicialmente, ya que las columnas se generan a partir de dataSource en Grid de columna de generación automática",
        Item: "artículo",
        Items: "artículos",
      },
    },
  });
};
