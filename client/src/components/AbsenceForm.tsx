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
  confirmTruth: z.boolean().refine(val => val === true, {
    message: "Sie müssen bestätigen, dass alle Angaben wahrheitsgemäß sind",
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

      console.log("Submitting absence:", absenceData);
      const response = await apiRequest("POST", "/api/absences", absenceData);
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Erfolgreich",
        description: "Entschuldigung wurde erfolgreich eingereicht.",
      });
      // Die Formularreset wird bereits in onSubmit durchgeführt
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
    
    // Reset the form immediately on submission
    form.reset({
      studentClass: "",
      profession: "",
      teacherName: "",
      absenceType: "",
      dateStart: "",
      dateEnd: "",
      reason: "",
      confirmTruth: false,
    });
  }

  if (isLoadingDropdowns || !dropdowns) {
    return <div>Lade Formulardaten...</div>;
  }

  return (
    <Card className="bg-white shadow-md rounded-lg p-6 max-w-4xl mx-auto">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-primary">Entschuldigung</h1>
        <p className="text-sm text-gray-600 mt-2">
          Schulversäumnisse sind innert 8, spätestens jedoch innert 14 Tagen bei den betreffenden
          Klassenlehrpersonen zu entschuldigen. Diese Entschuldigung ist ohne die erforderlichen
          Unterschriften ungültig.
        </p>
      </div>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Persönliche Informationen */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="col-span-2 border-b border-gray-200 pb-4 mb-2">
              <h2 className="text-lg font-semibold mb-4">Persönliche Informationen</h2>
            </div>
            
            <div>
              <p className="text-sm mb-1 font-medium text-gray-700">Name:</p>
              <p className="px-2 py-1 bg-gray-50 rounded border border-gray-200">{user?.name}</p>
            </div>
            
            <div className="flex space-x-4">
              <FormField
                control={form.control}
                name="profession"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <div className="flex items-center">
                      <FormLabel className="mr-2">Beruf</FormLabel>
                      <FormControl>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <SelectTrigger>
                            <SelectValue placeholder="Beruf auswählen" />
                          </SelectTrigger>
                          <SelectContent>
                            {dropdowns.professions.map((item) => (
                              <SelectItem key={item} value={item}>
                                {item}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="studentClass"
                render={({ field }) => (
                  <FormItem className="w-24">
                    <FormLabel>Klasse</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Klasse" />
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
            </div>
                
            <FormField
              control={form.control}
              name="teacherName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Lehrperson</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Lehrperson auswählen" />
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
          </div>
          
          {/* Grund der Abwesenheit */}
          <div className="border-t border-b border-gray-200 py-4">
            <h2 className="text-lg font-semibold mb-4">Grund</h2>
            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Textarea rows={4} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          {/* Daten der Abwesenheit */}
          <div className="border-b border-gray-200 pb-4">
            <h2 className="text-lg font-semibold mb-4">Daten der Abwesenheit</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
            </div>
          </div>
          
          {/* Bestätigung */}
          <div className="pt-2">
            <FormField
              control={form.control}
              name="confirmTruth"
              render={({ field }) => (
                <FormItem className="flex items-start space-x-2 mb-6">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>
                      Ich bestätige, dass alle Angaben wahrheitsgemäß sind und dass diese Entschuldigung mit den erforderlichen Unterschriften versehen wurde.
                    </FormLabel>
                    <FormMessage />
                  </div>
                </FormItem>
              )}
            />
          </div>

          <div className="mt-6 flex justify-end">
            <Button 
              type="submit" 
              disabled={submitMutation.isPending}
              className="px-6 py-2"
            >
              {submitMutation.isPending ? "Wird eingereicht..." : "Entschuldigung einreichen"}
            </Button>
          </div>
        </form>
      </Form>
    </Card>
  );
}
