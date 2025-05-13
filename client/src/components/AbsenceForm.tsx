import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { getFormattedDate } from "@/lib/utils";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { getDropdownOptions } from "@/lib/dropdowns";

// Extend the form schema with validation
const formSchema = z.object({
  studentClass: z.string({
    required_error: "Bitte Klasse auswählen",
  }),
  profession: z.string({
    required_error: "Bitte Beruf auswählen",
  }),
  teacherName: z.string({
    required_error: "Bitte Lehrer auswählen",
  }),
  absenceType: z.string({
    required_error: "Bitte Abwesenheitstyp auswählen",
  }),
  dateStart: z.string({
    required_error: "Bitte Startdatum angeben",
  }),
  dateEnd: z.string({
    required_error: "Bitte Enddatum angeben",
  }),
  reason: z.string().min(5, "Die Begründung muss mindestens 5 Zeichen enthalten"),
  confirmTruth: z.literal(true, {
    invalid_type_error: "Sie müssen bestätigen, dass alle Angaben wahrheitsgemäß sind",
  }),
});

type FormData = z.infer<typeof formSchema>;

export function AbsenceForm() {
  const { user } = useAuth();
  const { toast } = useToast();

  // Fetch dropdown options
  const { data: dropdowns, isLoading: isLoadingDropdowns } = useQuery({
    queryKey: ['/api/dropdowns'],
    select: (data) => getDropdownOptions(data),
  });

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      studentClass: "",
      profession: "",
      teacherName: "",
      absenceType: "",
      dateStart: "",
      dateEnd: "",
      reason: "",
      confirmTruth: false,
    },
  });

  const submitMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      // Create absence data from form input
      const absenceData = {
        studentId: user?.id!,
        studentName: user?.name!,
        studentClass: formData.studentClass,
        profession: formData.profession,
        teacherId: 0, // This would need to be fetched based on teacher name
        teacherName: formData.teacherName,
        absenceType: formData.absenceType,
        dateStart: formData.dateStart,
        dateEnd: formData.dateEnd,
        reason: formData.reason,
        submissionDate: getFormattedDate(new Date()),
      };

      const response = await apiRequest("POST", "/api/absences", absenceData);
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Erfolgreich",
        description: "Entschuldigung wurde erfolgreich eingereicht.",
      });
      form.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Fehler",
        description: `Entschuldigung konnte nicht eingereicht werden: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  function onSubmit(data: FormData) {
    submitMutation.mutate(data);
  }

  if (isLoadingDropdowns || !dropdowns) {
    return <div>Lade Formulardaten...</div>;
  }

  return (
    <Card className="bg-white shadow-md rounded-lg p-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="studentClass"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Klasse</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Klasse auswählen" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {dropdowns.classes.map((item) => (
                        <SelectItem key={item} value={item}>
                          {item}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="profession"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Beruf</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Beruf auswählen" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {dropdowns.professions.map((item) => (
                        <SelectItem key={item} value={item}>
                          {item}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="teacherName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Lehrer</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Lehrer auswählen" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {dropdowns.teachers.map((item) => (
                        <SelectItem key={item} value={item}>
                          {item}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="absenceType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Abwesenheitstyp</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Typ auswählen" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {dropdowns.absenceTypes.map((item) => (
                        <SelectItem key={item} value={item}>
                          {item}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="dateStart"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Abwesend von</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="dateEnd"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Abwesend bis</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="col-span-2">
              <FormField
                control={form.control}
                name="reason"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Grund der Abwesenheit</FormLabel>
                    <FormControl>
                      <Textarea rows={4} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="col-span-2">
              <FormField
                control={form.control}
                name="confirmTruth"
                render={({ field }) => (
                  <FormItem className="flex items-start space-x-2">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>
                        Ich bestätige, dass alle Angaben wahrheitsgemäß sind.
                      </FormLabel>
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <Button 
              type="submit" 
              disabled={submitMutation.isPending}
            >
              {submitMutation.isPending ? "Wird eingereicht..." : "Entschuldigung einreichen"}
            </Button>
          </div>
        </form>
      </Form>
    </Card>
  );
}
