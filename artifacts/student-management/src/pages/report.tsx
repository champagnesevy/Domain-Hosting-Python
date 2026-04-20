import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCreateStudent } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { Loader2, ClipboardCheck, User, BookOpen, Hash, MapPin, Activity } from "lucide-react";
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
import type { CreateStudentRequestStatus } from "@workspace/api-client-react/src/generated/api.schemas";

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  block: z.string().min(1, "Block is required"),
  course: z.string().min(1, "Course code is required"),
  room: z.string().min(1, "Room is required"),
  status: z.enum(["IN", "OUT", "N/A"] as const),
  remarks: z.string().min(1, "Remarks are required"),
});

type FormValues = z.infer<typeof formSchema>;

export default function Report() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const createStudent = useCreateStudent();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      block: "",
      course: "",
      room: "",
      status: "IN",
      remarks: "PRESENT",
    },
  });

  const onSubmit = (data: FormValues) => {
    createStudent.mutate({
      data: {
        ...data,
      }
    }, {
      onSuccess: () => {
        toast({ title: "Report submitted successfully!" });
        setLocation("/");
      },
      onError: (err) => {
        toast({ 
          title: "Submission failed", 
          description: err?.message || "An error occurred",
          variant: "destructive" 
        });
      }
    });
  };

  return (
    <div className="p-8 max-w-3xl mx-auto animate-in fade-in duration-500">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Submit Report</h1>
        <p className="text-slate-500 mt-1">Log a student's daily attendance and academic location.</p>
      </div>

      <Card className="shadow-sm border-slate-200">
        <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-6">
          <CardTitle className="text-xl flex items-center text-primary">
            <ClipboardCheck className="mr-2 h-5 w-5" />
            Class Record
          </CardTitle>
          <CardDescription>
            Enter the details for this specific session.
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
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
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
                  name="block"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Block <span className="text-destructive">*</span></FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                          <Input placeholder="e.g. A" className="pl-9" {...field} />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="course"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Course Code <span className="text-destructive">*</span></FormLabel>
                      <FormControl>
                        <div className="relative">
                          <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                          <Input placeholder="e.g. CS101" className="pl-9" {...field} />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="room"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Room Number <span className="text-destructive">*</span></FormLabel>
                    <FormControl>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input placeholder="e.g. Room 302" className="pl-9" {...field} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-slate-100 pt-6">
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status <span className="text-destructive">*</span></FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="w-full relative pl-9">
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center justify-center">
                              <Activity className="h-4 w-4 text-slate-400" />
                            </div>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="IN">IN</SelectItem>
                          <SelectItem value="OUT">OUT</SelectItem>
                          <SelectItem value="N/A">N/A</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="remarks"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Remarks <span className="text-destructive">*</span></FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select remarks" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="PRESENT">PRESENT</SelectItem>
                          <SelectItem value="ABSENT">ABSENT</SelectItem>
                          <SelectItem value="LATE">LATE</SelectItem>
                          <SelectItem value="EXCUSED">EXCUSED</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end">
                <Button 
                  type="submit" 
                  className="w-full md:w-auto"
                  disabled={createStudent.isPending}
                >
                  {createStudent.isPending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <ClipboardCheck className="mr-2 h-4 w-4" />
                  )}
                  Save Record
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
