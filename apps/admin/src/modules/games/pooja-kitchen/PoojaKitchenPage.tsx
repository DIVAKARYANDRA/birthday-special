import { useState } from "react";

import ThemesTab from "./components/ThemesTab";
import FoodsTab from "./components/FoodsTab";
import CustomersTab from "./components/CustomersTab";
import LevelsTab from "./components/LevelsTab";


type Tab =
  | "themes"
  | "foods"
  | "customers"
  | "levels";


const TABS: {
  id: Tab;
  label: string;
}[] = [
  {
    id: "themes",
    label: "Themes",
  },
  {
    id: "foods",
    label: "Foods",
  },
  {
    id: "customers",
    label: "Customers",
  },
  {
    id: "levels",
    label: "Levels",
  },
];



export default function PoojaKitchenPage() {


  const [activeTab, setActiveTab] =
    useState<Tab>("themes");



  return (

    <div>

      <h1>
        Pooja Kitchen 🍳
      </h1>


      <p
        style={{
          marginBottom: "1.5rem",
          color: "#666",
        }}
      >
        Manage kitchen themes, foods,
        customers and level configuration.
      </p>



      {/* Tabs */}

      <div
        style={{
          display: "flex",
          gap: "0.75rem",
          marginBottom: "1.5rem",
        }}
      >

        {
          TABS.map(
            (tab) => (

              <button

                key={tab.id}

                onClick={() =>
                  setActiveTab(tab.id)
                }

                style={{
                  padding:
                    "0.5rem 1rem",

                  borderRadius:
                    "0.5rem",

                  border:
                    activeTab === tab.id
                      ? "2px solid #4b2e83"
                      : "1px solid #ccc",

                  background:
                    activeTab === tab.id
                      ? "#4b2e83"
                      : "#fff",

                  color:
                    activeTab === tab.id
                      ? "#fff"
                      : "#333",

                  cursor:
                    "pointer",
                }}

              >

                {tab.label}

              </button>

            )
          )
        }

      </div>



      {/* Tab Content */}


      {
        activeTab === "themes" && (
          <ThemesTab />
        )
      }


      {
        activeTab === "foods" && (
          <FoodsTab />
        )
      }


      {
        activeTab === "customers" && (
          <CustomersTab />
        )
      }


      {
        activeTab === "levels" && (
          <LevelsTab />
        )
      }


    </div>

  );

}