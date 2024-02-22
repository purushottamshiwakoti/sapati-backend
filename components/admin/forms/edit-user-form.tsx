"use client";

import { editUserSchema } from "@/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { deleteUser, editUser } from "@/actions/admin";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";

interface EditUserFormProps {
  email: string;
  fullname: string;
  id: string;
}

export const EditUserForm = ({ email, fullname, id }: EditUserFormProps) => {
  const router = useRouter();
  const [viewPassword, setViewPassword] = useState(false);
  const [isPending, startTransistion] = useTransition();

  // 1. Define your form.
  const form = useForm<z.infer<typeof editUserSchema>>({
    resolver: zodResolver(editUserSchema),
    defaultValues: {
      email: email,
      fullName: fullname,
    },
  });

  // 2. Define a submit handler.
  function onSubmit(values: z.infer<typeof editUserSchema>) {
    // Do something with the form values.
    // ✅ This will be type-safe and validated.
    startTransistion(() => {
      editUser(values, id).then((data) => {
        if (data?.success) {
          toast.success(data.success);
          router.push("/users");
          router.refresh();
        }
        if (data?.error) {
          toast.error(data.error);
        }
      });
    });
  }
  function handleDelete() {
    // Do something with the form values.
    // ✅ This will be type-safe and validated.
    const confirmation = confirm("Are you sure you want to delete this user?");
    if (confirmation) {
      startTransistion(() => {
        deleteUser(id).then((data) => {
          if (data?.success) {
            toast.success(data.success);
            router.push("/users");
            router.refresh();
          }
          if (data?.error) {
            toast.error(data.error);
          }
        });
      });
    }
  }
  return (
    <div className="flex items-center  justify-center  ">
      <div className="bg-white dark:bg-black shadow-md p-10 lg:w-[40rem] w-full rounded-3xl border-2 ">
        <h2 className="mb-4 lg:text-lg  font-bold capitalize text-center">
          You are editing user that can access this dashboard!
        </h2>

        <div className="my-4 flex items-end justify-end">
          {/* <Button
            variant={"destructive"}
            onClick={handleDelete}
            disabled={isPending}
          >
            Delete
          </Button> */}
        </div>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-8"
            method="post"
          >
            <div className=" space-y-4">
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter full name here"
                        {...field}
                        disabled={isPending}
                      />
                    </FormControl>

                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter email here"
                        {...field}
                        type="email"
                        disabled={isPending}
                      />
                    </FormControl>

                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full" disabled={isPending}>
                Edit User
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
};
