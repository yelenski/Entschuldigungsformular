import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { getFormattedDate } from "@/lib/utils";
import { useRef, useEffect, useState } from "react";

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
  firstName: z.string().min(1, "Vorname ist erforderlich"),
  lastName: z.string().min(1, "Name ist erforderlich"),
  studentClass: z.string({
    required_error: "Bitte Klasse auswählen",
  }),
  profession: z.string({
    required_error: "Bitte Beruf auswählen",
  }),
  phonePrivate: z.string().optional(),
  phoneWork: z.string().optional(),
  educationType: z.enum(["BS", "BM"]).optional(),
  teachers: z.array(z.string()).min(1, "Mindestens ein Lehrer muss ausgewählt werden"),
  absenceDate: z.string({
    required_error: "Bitte Absenzdatum angeben",
  }),
  lessonCount: z.string().min(1, "Anzahl der Lektionen ist erforderlich"),
  reason: z.string().min(5, "Die Begründung muss mindestens 5 Zeichen enthalten"),
  location: z.string().min(1, "Ort ist erforderlich"),
  date: z.string().min(1, "Datum ist erforderlich"),
  signature: z.string().optional(),
  isLegal: z.boolean().optional(),
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

  // Signatur Canvas ref
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      studentClass: "",
      profession: "",
      phonePrivate: "",
      phoneWork: "",
      educationType: undefined,
      teachers: [],
      absenceDate: "",
      lessonCount: "",
      reason: "",
      location: "",
      date: getFormattedDate(new Date()),
      signature: "",
      isLegal: false,
      confirmTruth: false,
    },
  });

  const submitMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      // Create absence data from form input
      const absenceData = {
        studentId: user?.id!,
        studentName: user?.name!,
        fullName: `${formData.lastName} ${formData.firstName}`,
        studentClass: formData.studentClass,
        profession: formData.profession,
        phonePrivate: formData.phonePrivate || "",
        phoneWork: formData.phoneWork || "",
        educationType: formData.educationType || "BS",
        teacherIds: [], // Dies müsste basierend auf Lehrer-IDs aktualisiert werden
        teacherNames: formData.teachers,
        absenceDate: formData.absenceDate,
        lessonCount: formData.lessonCount,
        reason: formData.reason,
        location: formData.location,
        date: formData.date,
        isLegal: formData.isLegal || false,
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
      firstName: "",
      lastName: "",
      studentClass: "",
      profession: "",
      phonePrivate: "",
      phoneWork: "",
      educationType: undefined,
      teachers: [],
      absenceDate: "",
      lessonCount: "",
      reason: "",
      location: "",
      date: getFormattedDate(new Date()),
      isLegal: false,
      confirmTruth: false,
    });
  }

  if (isLoadingDropdowns || !dropdowns) {
    return <div>Lade Formulardaten...</div>;
  }

  return (
    <Card className="bg-white shadow-md rounded-lg p-6 max-w-4xl mx-auto">
      <div className="flex justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Entschuldigung</h1>
          <p className="text-sm text-gray-600 mt-2 max-w-2xl">
            Schulversäumnisse sind innert 8, spätestens jedoch innert 14 Tagen bei den betreffenden
            Klassenlehrpersonen zu entschuldigen. Diese Entschuldigung ist ohne die erforderlichen
            Unterschriften ungültig.
          </p>
        </div>
        <div className="text-right">
          <div className="text-4xl font-bold">BBB</div>
          <div className="text-sm">Berufsfachschule</div>
        </div>
      </div>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Persönliche Informationen */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="lastName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Nachname" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Vorname</FormLabel>
                  <FormControl>
                    <Input placeholder="Vorname" {...field} />
                  </FormControl>
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
                  <FormMessage />
                </FormItem>
              )}
            />
              
            <div className="flex items-center space-x-4">
              <div className="flex space-x-4 items-center">
                <FormField
                  control={form.control}
                  name="educationType"
                  render={({ field }) => (
                    <FormItem className="flex items-center space-x-2">
                      <FormControl>
                        <Checkbox
                          checked={field.value === "BS"}
                          onCheckedChange={(checked) => {
                            if (checked) field.onChange("BS");
                          }}
                        />
                      </FormControl>
                      <FormLabel>BS</FormLabel>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="educationType"
                  render={({ field }) => (
                    <FormItem className="flex items-center space-x-2">
                      <FormControl>
                        <Checkbox
                          checked={field.value === "BM"}
                          onCheckedChange={(checked) => {
                            if (checked) field.onChange("BM");
                          }}
                        />
                      </FormControl>
                      <FormLabel>BM</FormLabel>
                    </FormItem>
                  )}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="studentClass"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Klasse:</FormLabel>
                    <FormControl>
                      <Input placeholder="Klasse" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="phonePrivate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telefon P</FormLabel>
                    <FormControl>
                      <Input placeholder="Private Telefonnummer" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="phoneWork"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Telefon G</FormLabel>
                  <FormControl>
                    <Input placeholder="Geschäftliche Telefonnummer" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          {/* Grund der Abwesenheit */}
          <div className="border-t border-b border-gray-200 py-4">
            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Grund</FormLabel>
                  <FormControl>
                    <Textarea rows={4} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          {/* Unterschriften */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ort/Datum</FormLabel>
                  <FormControl>
                    <Input placeholder="z.B. Basel, 14.05.2025" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="flex flex-col">
              <FormLabel className="mb-2">Unterschriften</FormLabel>
              <div className="grid grid-cols-1 gap-2">
                <div className="flex justify-between">
                  <span>Lernende:r</span>
                  <FormField
                    control={form.control}
                    name="isLegal"
                    render={({ field }) => (
                      <FormItem className="flex items-center space-x-2">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <FormLabel>mündig</FormLabel>
                      </FormItem>
                    )}
                  />
                </div>
                <div>Eltern</div>
                <div>Ausbildungsverantwortliche:r</div>
              </div>
            </div>
          </div>
          
          {/* Versäumter Unterricht */}
          <div className="border-t border-gray-200 pt-4">
            <h2 className="text-lg font-semibold mb-4">Ich habe folgenden Unterricht bei folgenden Lehrpersonen versäumt:</h2>
            
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 mb-4">
              <FormField
                control={form.control}
                name="teachers"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Lehrperson</FormLabel>
                    <Select 
                      onValueChange={(value) => {
                        if (!field.value.includes(value)) {
                          field.onChange([...field.value, value]);
                        }
                      }}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Lehrpersonen auswählen" />
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
                name="absenceDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Datum der Absenz</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="lessonCount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Anzahl Lektionen</FormLabel>
                    <FormControl>
                      <Input type="number" min="1" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            {/* Ausgewählte Lehrer */}
            <FormField
              control={form.control}
              name="teachers"
              render={({ field }) => (
                <div>
                  {field.value.length > 0 && (
                    <div className="mb-4">
                      <div className="text-sm font-medium mb-2">Ausgewählte Lehrpersonen:</div>
                      <div className="flex flex-wrap gap-2">
                        {field.value.map((teacher, index) => (
                          <div 
                            key={index} 
                            className="flex items-center space-x-1 bg-gray-100 px-2 py-1 rounded"
                          >
                            <span>{teacher}</span>
                            <button 
                              type="button"
                              onClick={() => {
                                const newTeachers = [...field.value];
                                newTeachers.splice(index, 1);
                                field.onChange(newTeachers);
                              }}
                              className="text-red-500 hover:text-red-700"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            />
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
