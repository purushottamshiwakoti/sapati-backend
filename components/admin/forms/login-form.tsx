"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

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
import { useState, useTransition } from "react";

import { login } from "@/actions/admin";
import { loginSchema } from "@/schema";
import { Eye, EyeOff } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

export const LoginForm = () => {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl");
  const [isPending, startTransistion] = useTransition();
  const [viewPassword, setViewPassword] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  // 1. Define your form.
  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // 2. Define a submit handler.
  function onSubmit(values: z.infer<typeof loginSchema>) {
    // Do something with the form values.
    // ✅ This will be type-safe and validated.
    startTransistion(() => {
      setError("");
      login(values, callbackUrl).then((data) => {
        if (data?.error) {
          toast.error(data.error);
        }
      });
    });
  }
  return (
    <>
      <div className="bg-white md:p-10 p-4  rounded-lg shadow-xl ">
        <div className="mb-4">
          <h2 className="text-xl font-bold text-center text-black/80 capitalize">
            Log in to your account!
          </h2>
        </div>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-8 w-[20rem]"
          >
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter email here"
                        type="email"
                        {...field}
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
                Login
              </Button>
            </div>
            <div className="mt-2"></div>
          </form>
        </Form>
      </div>
    </>
  );
};
