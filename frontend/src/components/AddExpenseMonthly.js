import React, { useState } from "react";
import { useForm } from "react-hook-form";

import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { FormItem, FormLabel, FormControl } from "./ui/form";
import { Select, SelectItem } from "./ui/select";

import { API_URL } from "../lib/utils";
import Text from "./Text";

const AddExpenseForm = () => {
  const [showForm, setShowForm] = useState(false);
  // const [type, setType] = useState("once");

  const { register, handleSubmit, reset } = useForm({
    defaultValues: {
      name: "",
      amount: "",
      category_id: "",
      // date: "",
      date_start: "",
      date_end: "",
    },
  });

  const onSubmit = async (values) => {
    const user = JSON.parse(localStorage.getItem("user"));
    const userId = user?.id;

    const payload = {
      user_id: userId,
      name: values.name,
      amount: parseFloat(values.amount),
      category_id: parseInt(values.category_id),
      date_start: values.date_start + "-01",
    };

    // if (type === "monthly") {
    //   payload.date_start = values.date_start + "-01"; // hier die Monatskorrektur
    //   delete payload.date;
    // } else {
    //   delete payload.date_start;
    // }

    // const url =
    //   type === "monthly"
    //     ? `${API_URL}/monthly_expenses`
    //     : `${API_URL}/expenses`;

    const token = localStorage.getItem("token");

    try {
      const res = await fetch(`${API_URL}/monthly_expenses`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        alert("Saved!");
        reset();
        setShowForm(false);
        window.location.reload();
      } else {
        const data = await res.json();
        alert("Error: " + data.error);
      }
    } catch (err) {
      console.error("Error:", err);
      alert("Server Error!");
    }
  };

  return (
    <div className="my-2">
      <Button onClick={() => setShowForm(!showForm)} className="button">
        <Text variant="bodyBlack">
          {showForm ? "Close form" : "Add new regular expense"}
        </Text>
      </Button>
      {showForm && (
        <form onSubmit={handleSubmit(onSubmit)} className="max-w-sm mx-auto">
          {/* <FormItem>
            <FormLabel>Type</FormLabel>
            <FormControl>
              <Select value={type} onChange={(e) => setType(e.target.value)}>
                <SelectItem value="once">once</SelectItem>
                <SelectItem value="monthly">monthly</SelectItem>
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

            <FormItem>
              <FormLabel>Category</FormLabel>
              <FormControl>
                <Select {...register("category_id")} required>
                  <SelectItem value="">-- choose category --</SelectItem>
                  <SelectItem value="1">Shopping</SelectItem>
                  <SelectItem value="2">Entertainment</SelectItem>
                  <SelectItem value="3">Transport</SelectItem>
                  <SelectItem value="4">Rent & Energy</SelectItem>
                  <SelectItem value="5">Other</SelectItem>
                </Select>
              </FormControl>
            </FormItem>

            {/* {type === "once" && (
            <FormItem>
              <FormLabel>Date</FormLabel>
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

export default AddExpenseForm;
