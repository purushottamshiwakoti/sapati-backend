import * as z from "zod";

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(2, { message: "Password is required" }),
});

export const registerSchema = z.object({
  fullName: z.string().min(2,{message:"Fullname is required"}),
  email: z.string().email(),
  password: z.string().min(6, { message: "Password must be minimum of 6 characters" }),
});

export const updateUserSchema = z.object({
  fullName: z.string().min(2,{message:"Fullname is required"}),
  email: z.string().email(),
});

export const pageSchema = z.object({
  title: z.any().nullable(),
  shortDescription: z.optional(z.any()).nullable(),
  longDescription:  z.optional(z.any()).nullable(),
  stepDescription:  z.optional(z.any()).nullable(),
  featuresTitle:  z.optional(z.any()).nullable(),
  longDescriptionTitle:  z.optional(z.any()).nullable(),
  metaTitle:  z.optional(z.any()).nullable(),
  metaDescription:  z.optional(z.any()).nullable(),
  ogTitle:  z.optional(z.any()).nullable(),
  ogDescription:  z.optional(z.any()).nullable(),
  ogImage:  z.optional(z.any()).nullable(),
  ogImageAlt:  z.optional(z.any()).nullable(),

});

export const stepSchema = z.object({
  title: z.string().min(3,{message:"Step title is required"}),
 
});

export const featuresSchema = z.object({
  title: z.string().min(3,{message:"Title is required"}),
  description: z.string().min(3,{message:"Description is required"}),
  icon: z.string().min(1,{message:"Icon is required"}),
 
});


export const changePasswordSchema = z.object({
  password: z.string().min(1,{message:"Password is required"}),
  newPassword: z.string().min(6,{message:"Password must be minimum of 6 characters"}),
  confirmPassword: z.string(),

}) .refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export const otherPageSchema = z.object({
  title:z.optional(z.any()).nullable(),
  description:z.optional(z.any()).nullable(),
  metaTitle:  z.optional(z.any()).nullable(),
  metaDescription:  z.optional(z.any()).nullable(),
  ogTitle:  z.optional(z.any()).nullable(),
  ogDescription:  z.optional(z.any()).nullable(),
  ogImage:  z.optional(z.any()).nullable(),
  ogImageAlt:  z.optional(z.any()).nullable(),

});

export const settingsSchema=z.object({
  title:z.optional(z.any()).nullable(),               
  description:z.optional(z.any()).nullable(),         
  image :z.optional(z.any()).nullable(),       
  imageAlt :z.optional(z.any()).nullable(), 
  button:z.optional(z.any()).nullable(),
  buttonHref  :z.optional(z.any()).nullable(),        
  buttonTwo    :z.optional(z.any()).nullable(),       
  buttonTwoHref   :z.optional(z.any()).nullable(),    
  tasksTitle      :z.optional(z.any()).nullable(),    
  tasksDescription :z.optional(z.any()).nullable(),   
  tasksSubTitle    :z.optional(z.any()).nullable(),   
  tasksSubDescription :z.optional(z.any()).nullable(),
  tasksButton      :z.optional(z.any()).nullable(),   
  tasksButtonHref  :z.optional(z.any()).nullable(),   
  tasksImage       :z.optional(z.any()).nullable(), 
  tasksImageAlt   :z.optional(z.any()).nullable(),
  comapnyTitle   :z.optional(z.any()).nullable(),

})


export const chooseUsSchema = z.object({
  title: z.string().min(3,{message:"Title is required"}),
  description: z.string().min(3,{message:"Description is required"}),
  image: z.string().min(3,{message:"Image is required"}),
  imageAlt: z.string().min(1,{message:"Image alt text is required"}),
 
});


export const reviewsSchema = z.object({
  name: z.string().min(3,{message:"Name is required"}),
  description: z.string().min(3,{message:"Description is required"}),
  role: z.string().min(3,{message:"Role is required"}),
  rating: z.string().min(1,{message:"Rating is required"}),
});

export const companyImageSchema = z.object({
  image  :z.optional(z.any()).nullable(),
  imageAlt  :z.optional(z.any()).nullable(),
  imageTwo  :z.optional(z.any()).nullable(),
  imageTwoAlt  :z.optional(z.any()).nullable(),
  imageThree  :z.optional(z.any()).nullable(),
  imageThreeAlt  :z.optional(z.any()).nullable(),
  imageFour  :z.optional(z.any()).nullable(),
  imageFourAlt :z.optional(z.any()).nullable(),
});

export const seoSettingsSchema = z.object({
  ogTitle: z.string().min(3,{message:"OG Title is required"}),
  ogDescription: z.string().min(3,{message:"OG Description is required"}),
  ogImage: z.string().min(1,{message:"OG Image is required"}),
  ogImageAlt: z.string().min(1,{message:"OG Image alt text is required"}),
  googleSiteVerificationCode:z.optional(z.any()).nullable(),
 
});

export const categoriesSchema=z.object({
  name:z.string().min(3,{message:"Category Name is required"}),
});

export const blogSchema=z.object({
  title:z.string().min(3,{message:"Blog title is required"}),
  description:z.string().min(3,{message:"Blog description is required"}),
  slug:z.string().min(3,{message:"Blog slug is required"}),
  image:z.string().min(3,{message:"Blog image is required"}),
  bannerImage:z.optional(z.any()).nullable(),
  imageAlt:z.string().min(1,{message:"Blog image alt text is required"}),
  bannerImageAlt:z.optional(z.any()).nullable(),
  category_id:z.string().min(1,{message:"Blog category is required"}),
  metaTitle:z.optional(z.string()),
  metaDescription:z.optional(z.string()),
  ogTitle:  z.optional(z.any()).nullable(),
  ogDescription:  z.optional(z.any()).nullable(),
  ogImage:  z.optional(z.any()).nullable(),
  ogImageAlt:  z.optional(z.any()).nullable(),
});