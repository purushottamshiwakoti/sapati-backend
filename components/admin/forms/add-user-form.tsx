"use client";

import { addUserSchema } from "@/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { addUser } from "@/actions/admin";
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

export const AddUserForm = () => {
  const router = useRouter();
  const [viewPassword, setViewPassword] = useState(false);
  const [isPending, startTransistion] = useTransition();

  // 1. Define your form.
  const form = useForm<z.infer<typeof addUserSchema>>({
    resolver: zodResolver(addUserSchema),
    defaultValues: {
      email: "",
      fullName: "",
      password: "",
    },
  });

  // 2. Define a submit handler.
  function onSubmit(values: z.infer<typeof addUserSchema>) {
    // Do something with the form values.
    // ✅ This will be type-safe and validated.
    startTransistion(() => {
      addUser(values).then((data) => {
        if (data?.success) {
          toast.success(data.success);
          router.push("/admins");
          router.refresh();
        }
        if (data?.error) {
          toast.error(data.error);
        }
      });
    });
  }
  return (
    <div className="flex items-center  justify-center  ">
      <div className="bg-white dark:bg-black shadow-md p-10 lg:w-[40rem] w-full rounded-3xl border-2 ">
        <h2 className="mb-4 lg:text-lg  font-bold capitalize text-center">
          You are creating user that can access this dashboard!
        </h2>
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
              <div className="relative">
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter password here"
                          type={viewPassword ? "text" : "password"}
                          {...field}
                          disabled={isPending}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div
                  className="cursor-pointer"
                  onClick={() => setViewPassword(!viewPassword)}
                >
                  {viewPassword ? (
                    <Eye className="w-5 h-5 absolute right-2 top-10 " />
                  ) : (
                    <EyeOff className="w-5 h-5 absolute right-2 top-10 " />
                  )}
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={isPending}>
                Add User
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
};
