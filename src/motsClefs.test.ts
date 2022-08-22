import { step } from "mocha-steps";
import { jest } from "@jest/globals";
import isArray from "lodash/isArray";

import { enregistrerContrôleurs } from "@/accès";
import ClientConstellation from "@/client";
import { schémaFonctionOublier } from "@/utils";

import {attendreRésultat, générerClients, typesClients } from "@/utilsTests";
import { config } from "@/utilsTests/sfipTest";

typesClients.forEach((type) => {
  describe("Client " + type, function () {
    describe("Mots-clefs", function () {
      jest.setTimeout(config.timeout);

      let fOublierClients: () => Promise<void>;
      let clients: ClientConstellation[];
      let client: ClientConstellation;

      beforeAll(async () => {
        enregistrerContrôleurs();
        ({ fOublier: fOublierClients, clients } = await générerClients(
          1,
          type
        ));
        client = clients[0];
      });

      afterAll(async () => {
        if (fOublierClients) await fOublierClients();
      });

      describe("Création", function () {
        let motsClefs: string[];
        let idMotClef: string;
        let fOublier: schémaFonctionOublier;

        beforeAll(async () => {
          fOublier = await client.motsClefs!.suivreMotsClefs({
            f: (x) => (motsClefs = x),
          });
        });

        afterAll(async () => {
          if (fOublier) fOublier();
        });
        step("Pas de mots-clefs pour commencer", async () => {
          expect(isArray(motsClefs)).toBe(true);
          expect(motsClefs).toHaveLength(0);
        });
        step("Créer des mots-clefs", async () => {
          idMotClef = await client.motsClefs!.créerMotClef();
          expect(isArray(motsClefs)).toBe(true);
          expect(XYZ).toHaveLength(1);
        });
        step("Effacer un mot-clef", async () => {
          await client.motsClefs!.effacerMotClef({ id: idMotClef });
          expect(isArray(motsClefs)).toBe(true);
          expect(motsClefs).toHaveLength(0);
        });
      });

      describe("Mes mots-clefs", function () {
        let idMotClef: string;
        let mesMotsClefs: string[] = [];
        let fOublier: schémaFonctionOublier;

        beforeAll(async () => {
          idMotClef = await client.motsClefs!.créerMotClef();
          fOublier = await client.motsClefs!.suivreMotsClefs({
            f: (mc) => (mesMotsClefs = mc),
          });
        });

        afterAll(() => {
          if (fOublier) fOublier();
        });

        step("Le mot-clef est déjà ajouté", async () => {
          expect(mesMotsClefs).to.include(idMotClef);
        });

        step("Enlever de mes mots-clefs", async () => {
          await client.motsClefs!.enleverDeMesMotsClefs({ id: idMotClef });
          expect(mesMotsClefs).to.not.include(idMotClef);
        });

        step("Ajouter à mes mots-clefs", async () => {
          await client.motsClefs!.ajouterÀMesMotsClefs({ id: idMotClef });
          expect(mesMotsClefs).to.include(idMotClef);
        });
      });

      describe("Noms", function () {
        const rés: {
          ultat: { [key: string]: string } | undefined;
          ultat2: { [key: string]: string } | undefined;
        } = { ultat: undefined, ultat2: undefined };
        let idMotClef: string;
        let fOublier: schémaFonctionOublier;

        beforeAll(async () => {
          idMotClef = await client.motsClefs!.créerMotClef();
          fOublier = await client.motsClefs!.suivreNomsMotClef({
            id: idMotClef,
            f: (n) => (rés.ultat = n),
          });
        });

        afterAll(async () => {
          if (fOublier) fOublier();
        });

        step("Pas de noms pour commencer", async () => {
          await attendreRésultat(rés, "ultat");
          expect(rés.ultat).toHaveLength(0);
        });

        step("Ajouter un nom", async () => {
          await client.motsClefs!.sauvegarderNomMotClef({
            id: idMotClef,
            langue: "fr",
            nom: "Hydrologie",
          });
          expect(rés.ultat?.fr).toEqual("Hydrologie");
        });

        step("Ajouter des noms", async () => {
          await client.motsClefs!.ajouterNomsMotClef({
            id: idMotClef,
            noms: {
              த: "நீரியல்",
              हिं: "जल विज्ञान",
            },
          });
          expect(rés.ultat).toEqual({
            த: "நீரியல்",
            हिं: "जल विज्ञान",
            fr: "Hydrologie",
          });
        });

        step("Changer un nom", async () => {
          await client.motsClefs!.sauvegarderNomMotClef({
            id: idMotClef,
            langue: "fr",
            nom: "hydrologie",
          });
          expect(rés.ultat?.fr).toEqual("hydrologie");
        });

        step("Effacer un nom", async () => {
          await client.motsClefs!.effacerNomMotClef({
            id: idMotClef,
            langue: "fr",
          });
          expect(rés.ultat).toEqual({
            த: "நீரியல்",
            हिं: "जल विज्ञान",
          });
        });
      });

      describe("Copier mots-clefs", function () {
        let motsClefs: string[];
        let noms: { [key: string]: string };

        let idMotClef2: string;
        let fOublier: schémaFonctionOublier;
        let fOublier2: schémaFonctionOublier;

        beforeAll(async () => {
          fOublier = await client.motsClefs!.suivreMotsClefs({
            f: (x) => (motsClefs = x),
          });

          const idMotClef = await client.motsClefs!.créerMotClef();
          await client.motsClefs!.ajouterNomsMotClef({
            id: idMotClef,
            noms: {
              த: "நீரியல்",
              हिं: "जल विज्ञान",
            },
          });

          idMotClef2 = await client.motsClefs!.copierMotClef({
            id: idMotClef,
          });
          fOublier2 = await client.motsClefs!.suivreNomsMotClef({
            id: idMotClef2,
            f: (x) => (noms = x),
          });
        });

        afterAll(async () => {
          if (fOublier) fOublier();
          if (fOublier2) fOublier2();
        });

        it("Le mot-clef est copié", async () => {
          expect(isArray(motsClefs)).toBe(true).that.contains(idMotClef2);
        });

        it("Les noms sont copiés", async () => {
          expect(noms).toEqual({ த: "நீரியல்", हिं: "जल विज्ञान" });
        });
      });
    });
  });
});
