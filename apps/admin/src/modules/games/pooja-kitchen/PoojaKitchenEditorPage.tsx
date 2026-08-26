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



export default function PoojaKitchenEditorPage() {


  const [activeTab, setActiveTab] =
    useState<Tab>("themes");



  const tabs: {
    id: Tab;
    label: string;
  }[] = [

    {
      id:"themes",
      label:"Themes",
    },

    {
      id:"foods",
      label:"Foods",
    },

    {
      id:"customers",
      label:"Customers",
    },

    {
      id:"levels",
      label:"Levels",
    },

  ];



  return (

    <div>


      <h1>
        Pooja Kitchen 🍳
      </h1>


      <p>
        Manage kitchen themes, foods,
        customers and levels.
      </p>



      <div

        style={{
          display:"flex",
          gap:"0.5rem",
          marginBottom:"1.5rem",
        }}

      >


        {
          tabs.map(
            (tab)=>(

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
                      ? "#eee"
                      : "#fff",

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



      <div>


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


    </div>

  );

}