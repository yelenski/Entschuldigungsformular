import React from "react";
import { useForm, Controller } from "react-hook-form";
import { Input } from "@/components/ui/input";

export function TestMinimalForm() {
  const { control, handleSubmit } = useForm({ defaultValues: { name: "" } });
  const onSubmit = (data: any) => alert(JSON.stringify(data));

  return (
    <form onSubmit={handleSubmit(onSubmit)} style={{ maxWidth: 400, margin: 32 }}>
      <Controller
        name="name"
        control={control}
        render={({ field }) => (
          <Input placeholder="Name" {...field} />
        )}
      />
      <button type="submit" style={{ marginTop: 16 }}>Absenden</button>
    </form>
  );
}
