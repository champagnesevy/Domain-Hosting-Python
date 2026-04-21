import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCreateStudent } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { Loader2, UserPlus, FileText, Phone, Mail, GraduationCap } from "lucide-react";
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  phone: z.string().optional(),
  yearLevel: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function Register() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const createStudent = useCreateStudent();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      yearLevel: "",
    },
  });

  const onSubmit = (data: FormValues) => {
    createStudent.mutate({
      data: {
        ...data,
        status: "N/A",
        remarks: "NEWLY REGISTERED",
        block: "TBD",
        course: "TBD",
        room: "TBD",
      }
    }, {
      onSuccess: () => {
        toast({ title: "Student registered successfully!" });
        setLocation("/");
      },
      onError: (err) => {
        toast({ 
          title: "Registration failed", 
          description: err?.message || "An error occurred",
          variant: "destructive" 
        });
      }
    });
  };

  return (
    <div className="p-8 max-w-3xl mx-auto animate-in fade-in duration-500">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">New Registration</h1>
        <p className="text-slate-500 mt-1">Enroll a new student into the system database.</p>
      </div>

      <Card className="shadow-sm border-slate-200">
        <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-6">
          <CardTitle className="text-xl flex items-center text-primary">
            <UserPlus className="mr-2 h-5 w-5" />
            Student Details
          </CardTitle>
          <CardDescription>
            Provide the required contact and academic information.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name <span className="text-destructive">*</span></FormLabel>
                    <FormControl>
                      <div className="relative">
                        <FileText className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input placeholder="e.g. Jane Doe" className="pl-9" {...field} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                          <Input placeholder="jane.doe@university.edu" type="email" className="pl-9" {...field} />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                          <Input placeholder="+1 (555) 000-0000" className="pl-9" {...field} />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="yearLevel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Year Level</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="w-full relative pl-9">
                          <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center justify-center">
                            <GraduationCap className="h-4 w-4 text-slate-400" />
                          </div>
                          <SelectValue placeholder="Select year level" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="1st Year">1st Year</SelectItem>
                        <SelectItem value="2nd Year">2nd Year</SelectItem>
                        <SelectItem value="3rd Year">3rd Year</SelectItem>
                        <SelectItem value="4th Year">4th Year</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="pt-4 border-t border-slate-100 flex justify-end">
                <Button 
                  type="submit" 
                  className="w-full md:w-auto"
                  disabled={createStudent.isPending}
                >
                  {createStudent.isPending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <UserPlus className="mr-2 h-4 w-4" />
                  )}
                  Register Student
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
