import React from "react";
import FastlegeContainer, {
  texts,
} from "../../src/containers/FastlegeContainer";
import { apiMock } from "../stubs/stubApi";
import nock from "nock";
import { QueryClient, QueryClientProvider } from "react-query";
import { render } from "@testing-library/react";
import { expect } from "chai";

let queryClient: QueryClient;
let apiMockScope: nock.Scope;

const generalError = {
  harTilgang: false,
  begrunnelse: null,
};

const noAccess = {
  harTilgang: false,
  begrunnelse: "SYFO",
};

describe("FastlegeContainerTests", () => {
  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    apiMockScope = apiMock();
  });
  afterEach(() => {
    nock.cleanAll();
  });

  it("Manglende tilgang til finnfastlege gir melding om å kontakte identansvarlig", async () => {
    apiMockScope
      .get(`/syfo-tilgangskontroll/api/tilgang/navident/syfo`)
      .reply(403, () => noAccess);
    const wrapper = render(
      <QueryClientProvider client={queryClient}>
        <FastlegeContainer />
      </QueryClientProvider>
    );

    const title = await wrapper.findByRole("heading", {
      name: texts.noAccessTitle,
    });
    const message = await wrapper.findByText(texts.noAccessMessage);
    expect(title).to.exist;
    expect(message).to.exist;
  });

  it("Feil i kall mot tilgangstjenesten gir generell feilmelding", async () => {
    apiMockScope
      .get(`/syfo-tilgangskontroll/api/tilgang/navident/syfo`)
      .reply(500, () => generalError);
    const wrapper = render(
      <QueryClientProvider client={queryClient}>
        <FastlegeContainer />
      </QueryClientProvider>
    );

    const title = await wrapper.findByRole("heading", {
      name: texts.generalErrorTitle,
    });
    const message = await wrapper.findByText(texts.generalErrorMessage);
    expect(title).to.exist;
    expect(message).to.exist;
  });
});
