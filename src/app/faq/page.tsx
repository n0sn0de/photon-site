import { Metadata } from "next";
import { Section } from "@/components/section";
import { FAQAccordion } from "./accordion";

export const metadata: Metadata = {
  title: "FAQ — PHOTON",
  description: "Frequently asked questions about PHOTON, the fee token of AtomOne.",
};

const FAQ_ITEMS = [
  {
    q: "What is PHOTON?",
    a: "PHOTON is the dedicated fee token of the AtomOne blockchain. Every transaction on AtomOne (and eventually all IBC/ICS payments across its shards) requires PHOTON for gas fees. It's created by burning ATONE (the staking token) through a one-way conversion, has a hard cap of 1 billion tokens, and is non-inflationary by design.",
  },
  {
    q: "Why does AtomOne need two tokens?",
    a: "Security. When a single token handles both staking and fees, an attacker can buy it on exchanges, accumulate enough to control consensus (⅔ of stake), and manipulate IBC transactions to steal pegged assets. With separated tokens, accumulating fee tokens (PHOTON) gives zero consensus power. Attacking requires acquiring ATONE, which is illiquid by design.",
  },
  {
    q: "How is the conversion rate calculated?",
    a: "The formula is: rate = (1,000,000,000 − photon_supply) / atone_supply. The rate naturally decreases over time as more PHOTON is minted and as ATONE inflates at 7-20% annually. Early burners get more PHOTON per ATONE.",
  },
  {
    q: "Can I convert PHOTON back to ATONE?",
    a: "No. The burn is irreversible at the protocol level. ATONE → PHOTON is a one-way gate. However, you can always trade PHOTON for ATONE on decentralized exchanges like Osmosis.",
  },
  {
    q: "Do I need PHOTON to mint my first PHOTON?",
    a: "No — the MsgMintPhoton transaction type is fee-exempt by default. You can burn ATONE to mint PHOTON without paying any fees. Once you have PHOTON, you'll use it for all other transaction types.",
  },
  {
    q: "Is PHOTON inflationary?",
    a: "No. PHOTON has a hard cap of 1 billion tokens that can never be exceeded. New PHOTON is only created when someone burns ATONE — there is no inflation, no block rewards in PHOTON, and no other minting mechanism.",
  },
  {
    q: "Where can I buy or trade PHOTON?",
    a: "PHOTON trades on Osmosis DEX — the primary decentralized exchange in the Cosmos ecosystem. The main trading pair is PHOTON/ATONE. You can also mint it directly on-chain by burning ATONE.",
  },
  {
    q: "What wallets support PHOTON?",
    a: "Any wallet that supports the AtomOne chain can hold PHOTON. Keplr is the most popular option. You can also use Ledger hardware wallets via the Cosmos app.",
  },
  {
    q: "What happens when PHOTON becomes the exclusive fee token?",
    a: "Currently, AtomOne accepts both ATONE and PHOTON for transaction fees (transition period). A future governance vote will activate PHOTON-only fees — at that point, every transaction will require PHOTON. The MsgMintPhoton transaction will remain fee-exempt.",
  },
  {
    q: "What is AtomOne's relationship to the Cosmos Hub?",
    a: "AtomOne is a community-driven fork of the Cosmos Hub (Gaia), created after Proposal #848 reduced ATOM inflation. It's a return to the original multi-token architecture proposed in 2019. ATONE was distributed to ATOM holders at the time of the fork.",
  },
];

export default function FAQPage() {
  return (
    <Section
      tag="Common Questions"
      title="FAQ"
      desc="Everything you need to know about PHOTON, the dual-token model, and how it all works."
      dark
    >
      <FAQAccordion items={FAQ_ITEMS} />
    </Section>
  );
}
