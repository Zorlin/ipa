import { optsConstellation } from "@/client.js";

import {
  générerMandataire,
  ClientMandatairifiable,
  MandataireClientConstellation,
} from "@constl/mandataire";
import {
  MessageDeTravailleur,
  MessagePourTravailleur,
  MessageErreurDeTravailleur,
} from "@/mandataire/messages.js";
import GestionnaireClient from "@/mandataire/gestionnaireClient.js";

export class MandataireClientProc extends ClientMandatairifiable {
  client: GestionnaireClient;

  constructor(opts: optsConstellation = {}) {
    super();

    this.client = new GestionnaireClient(
      (m: MessageDeTravailleur) => {
        this.événements.emit("message", m);
      },
      (erreur: string, id?: string) => {
        const messageErreur: MessageErreurDeTravailleur = {
          type: "erreur",
          id,
          erreur,
        };
        this.événements.emit("message", messageErreur);
      },
      opts
    );
  }

  envoyerMessage(message: MessagePourTravailleur) {
    this.client.gérerMessage(message);
  }
}

export const générerMandataireProc = (
  opts: optsConstellation = {}
): MandataireClientConstellation => {
  return générerMandataire(new MandataireClientProc(opts));
};

export default générerMandataireProc;
