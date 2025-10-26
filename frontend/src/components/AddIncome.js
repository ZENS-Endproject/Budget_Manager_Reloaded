import React, { useState } from "react";
import { useForm } from "react-hook-form";

import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel } from "./ui/form";
import { Select, SelectItem } from "./ui/select";

import { API_URL } from "../lib/utils";

const AddIncomeForm = () => {
  const [showForm, setShowForm] = useState(false);
  const [type, setType] = useState("once");

  const { register, handleSubmit, reset } = useForm({
    defaultValues: {
      name: "",
      amount: "",
      date: "",
      date_start: "",
    },
  });

  const onSubmit = async (values) => {
    const user = JSON.parse(localStorage.getItem("user"));
    const userId = user?.id;

    const payload = {
      user_id: userId,
      ...values,
      amount: parseFloat(values.amount),
    };

    if (type === "monthly") {
      delete payload.date;
      payload.date_start = values.date_start + "-01";
    } else {
      delete payload.date_start;
    }

    const url =
      type === "monthly" ? `${API_URL}/monthly_incomes` : `${API_URL}/incomes`;

    const token = localStorage.getItem("token");

    try {
      const res = await fetch(url, {
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
    <div className="text-center mt-10">
      <Button onClick={() => setShowForm(!showForm)} className="mb-4">
        {showForm ? "Close form" : "Add new income"}
      </Button>

      {showForm && (
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="max-w-sm mx-auto space-y-4"
        >
          <FormItem>
            <FormLabel>Typ</FormLabel>
            <FormControl>
              <Select value={type} onChange={(e) => setType(e.target.value)}>
                <SelectItem value="once">Once</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
              </Select>
            </FormControl>
          </FormItem>

          <FormItem>
            <FormLabel>Name</FormLabel>
            <FormControl>
              <Input placeholder="Income name" {...register("name")} required />
            </FormControl>
          </FormItem>

          <FormItem>
            <FormLabel>Betrag (€)</FormLabel>
            <FormControl>
              <Input
                type="number"
                step="0.01"
                {...register("amount")}
                required
              />
            </FormControl>
          </FormItem>

          {type === "once" && (
            <FormItem>
              <FormLabel>Datum</FormLabel>
              <FormControl>
                <Input type="date" {...register("date")} required />
              </FormControl>
            </FormItem>
          )}

          {type === "monthly" && (
            <>
              <FormItem>
                <FormLabel>Startmonat</FormLabel>
                <FormControl>
                  <Input type="month" {...register("date_start")} required />
                </FormControl>
              </FormItem>
            </>
          )}

          <Button type="submit" className="w-full">
            Speichern
          </Button>
        </form>
      )}
    </div>
  );
};

export default AddIncomeForm;
