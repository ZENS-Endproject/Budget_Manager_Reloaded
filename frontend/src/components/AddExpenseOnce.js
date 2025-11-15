import React, { useState } from "react";
import { useForm } from "react-hook-form";

import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { FormItem, FormLabel, FormControl } from "./ui/form";
import { Select, SelectItem } from "./ui/select";

import { API_URL } from "../lib/utils";
import Text from "./Text";
import { useTranslation } from "react-i18next";
import i18n from "../locales/i18n";

const AddExpenseForm = () => {
  const { t } = useTranslation();
  const [showForm, setShowForm] = useState(false);
  // const [type, setType] = useState("once");

  const { register, handleSubmit, reset } = useForm({
    defaultValues: {
      name: "",
      amount: "",
      category_id: "",
      date: "",
      // start_date: "",
      // end_date: "",
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
      date: values.date,
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
      const res = await fetch(`${API_URL}/expenses`, {
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
          {showForm ? t("closeForm") : t("addNewOneTimeExpense")}
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

          <FormItem>
            <FormLabel>{t("name")}</FormLabel>
            <FormControl>
              <Input
                className="font-voces text-xs text-black"
                {...register("name")}
                required
              />
            </FormControl>
          </FormItem>

          <FormItem>
            <FormLabel>{t("price")} (€)</FormLabel>
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
            <FormLabel>{t("category")}</FormLabel>
            <FormControl>
              <Select {...register("category_id")} required>
                <SelectItem value="">{t("chooseCategory")}</SelectItem>
                <SelectItem value="1">{t("shopping")}</SelectItem>
                <SelectItem value="2">{t("entertainment")}</SelectItem>
                <SelectItem value="3">{t("transport")}</SelectItem>
                <SelectItem value="4">{t("rentEnergy")}</SelectItem>
                <SelectItem value="5">{t("other")}</SelectItem>
              </Select>
            </FormControl>
          </FormItem>

          <FormItem>
            <FormLabel>{t("date")}</FormLabel>
            <FormControl>
              <Input type="date" {...register("date")} required />
            </FormControl>
          </FormItem>

          {/* {type === "monthly" && (
            <>
              <FormItem>
                <FormLabel>Start date</FormLabel>
                <FormControl>
                  <Input type="month" {...register("date_start")} required />
                </FormControl>
              </FormItem>
            </>
          )} */}

          <Button type="submit" className="button mt-2">
            <Text variant="bodyBlack">{t("save")}</Text>
          </Button>
        </form>
      )}
    </div>
  );
};

export default AddExpenseForm;
