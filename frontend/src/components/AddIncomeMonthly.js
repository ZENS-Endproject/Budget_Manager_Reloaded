import React, { useState } from "react";
import { useForm } from "react-hook-form";

import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel } from "./ui/form";
import { Select, SelectItem } from "./ui/select";

import { API_URL } from "../lib/utils";
import Text from "./Text";

const AddIncomeForm = () => {
  const [showForm, setShowForm] = useState(false);
  // const [type, setType] = useState("once");

  const { register, handleSubmit, reset } = useForm({
    defaultValues: {
      name: "",
      amount: "",
      // date: "",
      date_start: "",
    },
  });

  const onSubmit = async (values) => {
    const user = JSON.parse(localStorage.getItem("user"));
    const userId = user?.id;

    const payload = {
      user_id: userId,
      name: values.name,
      amount: parseFloat(values.amount),
      date_start: values.date_start + "-01",
    };

    // if (type === "monthly") {
    //   delete payload.date;
    //   payload.date_start = values.date_start + "-01";
    // } else {
    //   delete payload.date_start;
    // }

    // const url =
    //   type === "monthly" ? `${API_URL}/monthly_incomes` : `${API_URL}/incomes`;

    const token = localStorage.getItem("token");

    try {
      const res = await fetch(`${API_URL}/monthly_incomes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },

        body: JSON.stringify(payload),
      });

      if (res.ok) {
        alert("Saved");
        reset();
        setShowForm(false);
        window.location.reload();
      } else {
        const data = await res.json();
        alert("Fehler: " + data.error);
      }
    } catch (err) {
      console.error("Error:", err);
      alert("Server error!");
    }
  };

  return (
    <div className="my-2">
      <Button onClick={() => setShowForm(!showForm)} className="button">
        <Text variant="bodyBlack">
          {showForm ? "Close form" : "Add new regular income"}
        </Text>
      </Button>

      {showForm && (
        <form onSubmit={handleSubmit(onSubmit)} className="max-w-sm mx-auto">
          {/* <FormItem>
            <FormLabel>Typ</FormLabel>
            <FormControl>
              <Select value={type} onChange={(e) => setType(e.target.value)}>
                <SelectItem value="once">Once</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
              </Select>
            </FormControl>
          </FormItem> */}
          <Text variant="smallBlack">
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input
                  className="font-voces text-xs text-black"
                  {...register("name")}
                  required
                />
              </FormControl>
            </FormItem>

            <FormItem>
              <FormLabel>Amount (€)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  step="0.01"
                  {...register("amount")}
                  required
                />
              </FormControl>
            </FormItem>

            {/* {type === "once" && (
              <FormItem>
                <FormLabel>Datum</FormLabel>
                <FormControl>
                  <Input type="date" {...register("date")} required />
                </FormControl>
              </FormItem>
            )} */}

            <FormItem>
              <FormLabel>Start date</FormLabel>
              <FormControl>
                <Input type="month" {...register("date_start")} required />
              </FormControl>
            </FormItem>
          </Text>
          <Button type="submit" className="button mt-2">
            <Text variant="bodyBlack">Save</Text>
          </Button>
        </form>
      )}
    </div>
  );
};

export default AddIncomeForm;
