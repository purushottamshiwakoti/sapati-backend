"use client";

import { z } from "zod";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
export const termsFormSchema = z.object({
  title: z.string().min(1, {
    message: "Title is required",
  }),
  description: z.string().min(1, {
    message: "Description is required",
  }),
});

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

import EditorToolbar, { formats, modules } from "@/components/editor-toolbar";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { useTransition } from "react";
import { addTerms } from "@/actions/addpage";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Terms } from "@prisma/client";

export const AddTermsForm = ({ data }: { data: Terms }) => {
  const [isPending, startTransistion] = useTransition();
  const router = useRouter();

  const form = useForm<z.infer<typeof termsFormSchema>>({
    resolver: zodResolver(termsFormSchema),
    defaultValues: {
      title: data.title,
      description: data.description,
    },
  });

  // 2. Define a submit handler.
  function onSubmit(values: z.infer<typeof termsFormSchema>) {
    // Do something with the form values.
    // ✅ This will be type-safe and validated.
    startTransistion(() => {
      addTerms(values, data.id).then((data) => {
        if (data?.success) {
          toast.success(data.success);
          // router.push("/admins");
          router.refresh();
        }
        if (data?.error) {
          toast.error(data.error);
        }
      });
    });
  }
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter title here"
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
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <div>
                  <EditorToolbar />
                  <ReactQuill
                    theme="snow"
                    placeholder={"Write  description here..."}
                    modules={modules}
                    formats={formats}
                    {...field}
                    readOnly={isPending}
                  />
                </div>
              </FormControl>

              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isPending}>
          Save
        </Button>
      </form>
    </Form>
  );
};
