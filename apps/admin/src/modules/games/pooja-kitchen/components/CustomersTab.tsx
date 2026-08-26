import { useEffect, useState } from "react";

import {
  customerApi,
  type PoojaKitchenCustomer,
} from "../poojaKitchenApi";



export default function CustomersTab() {


  const [customers, setCustomers] =
    useState<PoojaKitchenCustomer[]>([]);


  const [loading, setLoading] =
    useState(true);


  const [error, setError] =
    useState<string | null>(null);



  useEffect(
    () => {

      loadCustomers();

    },
    []
  );



  async function loadCustomers() {

    try {

      setLoading(true);


      const data =
        await customerApi.list();


      setCustomers(data);

    }
    catch (err) {

      console.error(
        "Failed to load customers",
        err
      );


      setError(
        "Failed to load customers"
      );

    }
    finally {

      setLoading(false);

    }

  }



  if (loading) {

    return (
      <div>
        Loading customers...
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
        Kitchen Customers
      </h2>



      {
        customers.length === 0 && (

          <p>
            No customers available.
          </p>

        )
      }



      {
        customers.map(
          (customer) => (

            <div

              key={customer.id}

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
                {customer.name}
              </h3>



              {
                customer.description && (

                  <p>
                    {customer.description}
                  </p>

                )
              }



              <p>

                <strong>
                  Type:
                </strong>

                {" "}

                {customer.customer_type}

              </p>



              <p>

                <strong>
                  Patience:
                </strong>

                {" "}

                {customer.patience_seconds}

                {" seconds"}

              </p>



              <p>

                <strong>
                  Active:
                </strong>

                {" "}

                {
                  customer.is_active
                    ? "Yes"
                    : "No"
                }

              </p>



              <hr />



              <p>

                <strong>
                  Avatar Media:
                </strong>

                {" "}

                {
                  customer.avatar_media_id
                    ??
                    "Not assigned"
                }

              </p>



              <p>

                <strong>
                  Happy Media:
                </strong>

                {" "}

                {
                  customer.happy_media_id
                    ??
                    "Not assigned"
                }

              </p>



              <p>

                <strong>
                  Angry Media:
                </strong>

                {" "}

                {
                  customer.angry_media_id
                    ??
                    "Not assigned"
                }

              </p>


            </div>

          )
        )
      }


    </div>

  );

}