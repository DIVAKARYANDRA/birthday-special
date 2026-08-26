import { useEffect, useState } from "react";

import {
  themeApi,
  type PoojaKitchenTheme,
} from "../poojaKitchenApi";



export default function ThemesTab() {


  const [themes, setThemes] =
    useState<PoojaKitchenTheme[]>([]);


  const [loading, setLoading] =
    useState(true);


  const [error, setError] =
    useState<string | null>(null);



  useEffect(
    () => {

      loadThemes();

    },
    []
  );



  async function loadThemes() {

    try {

      setLoading(true);

      const data =
        await themeApi.list();


      setThemes(data);

    }
    catch (err) {

      console.error(
        "Failed to load themes",
        err
      );

      setError(
        "Failed to load themes"
      );

    }
    finally {

      setLoading(false);

    }

  }



  if (loading) {

    return (
      <div>
        Loading themes...
      </div>
    );

  }



  if (error) {

    return (
      <div>
        {error}
      </div>
    );

  }



  return (

    <div>

      <h2>
        Kitchen Themes
      </h2>



      {
        themes.length === 0 && (

          <p>
            No themes available.
          </p>

        )
      }



      {
        themes.map(
          (theme) => (

            <div

              key={theme.id}

              style={{
                border:
                  "1px solid #ddd",

                borderRadius:
                  "0.5rem",

                padding:
                  "1rem",

                marginBottom:
                  "1rem",

                background:
                  "#fff",
              }}

            >

              <h3>
                {theme.name}
              </h3>


              <p>
                {theme.description ?? 
                  "No description"}
              </p>



              <div>

                <strong>
                  Status:
                </strong>

                {" "}

                {
                  theme.is_active
                    ? "Active"
                    : "Inactive"
                }

              </div>



              <div>

                <strong>
                  Background Media ID:
                </strong>

                {" "}

                {
                  theme.background_media_id
                    ??
                    "Not assigned"
                }

              </div>


            </div>

          )
        )
      }


    </div>

  );

}