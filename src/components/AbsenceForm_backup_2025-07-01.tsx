// Backup of AbsenceForm.tsx on 2025-07-01 before erneute Reduktion auf Minimalbeispiel
//
// Diese Datei dient als Sicherungskopie des aktuellen Standes.

import { useForm, FieldValues } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery, useMutation } from "@tanstack/react-query";
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
  educationType: z.enum(["BS", "BM"], {
    required_error: "Bitte Schultyp auswählen",
  }),
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
  parentSignature: z.boolean().optional(),
  supervisorSignature: z.boolean().optional(),
  confirmTruth: z.boolean().refine(val => val === true, {
    message: "Sie müssen bestätigen, dass alle Angaben wahrheitsgemäß sind",
  }),
});

// Ensure FormData extends FieldValues
interface FormData extends FieldValues {
  date: string;
  firstName: string;
  lastName: string;
  studentClass: string;
  profession: string;
  educationType: "BS" | "BM";
  teachers: string[];
  absenceDate: string;
  lessonCount: string;
  reason: string;
  location: string;
  signature?: string;
  isLegal?: boolean;
  parentSignature?: boolean;
  supervisorSignature?: boolean;
  confirmTruth: boolean;
}

export function AbsenceForm() {
  const { user } = useAuth();
  const { toast } = useToast();

  // Correct default values to match the schema
  const defaultValues: FormData = {
    firstName: "",
    lastName: "",
    studentClass: "",
    profession: "",
    phonePrivate: "",
    phoneWork: "",
    educationType: "BS",
    teachers: [],
    absenceDate: "",
    lessonCount: "",
    reason: "",
    location: "",
    date: getFormattedDate(new Date()),
    signature: "",
    isLegal: false,
    parentSignature: false,
    supervisorSignature: false,
    confirmTruth: false,
  };

  // Fetch dropdown options
  const { data: dropdowns, isLoading: isLoadingDropdowns } = useQuery({
    queryKey: ['/api/dropdowns'],
    select: (data) => getDropdownOptions(data),
  });

  // Signatur Canvas ref
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  
  // Ensure the useForm hook is properly typed with FormData
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  // Canvas initialisieren
  useEffect(() => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.strokeStyle = '#000';
      }
    }
  }, [canvasRef]);

  function clearSignature() {
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext("2d");
      if (ctx) {
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      }
    }
  }

  const submitMutation = useMutation({
    mutationFn: async (absenceData: any) => {
      if (!user) throw new Error("Benutzer nicht angemeldet");

      console.log("Transformed absence data:", absenceData); // Debug log

      const response = await apiRequest("POST", "/api/absences", absenceData);
      const result = await response.json();
      console.log("Server response:", result); // Debug log
      return result;
    },
    onSuccess: () => {
      toast({
        title: "Erfolgreich",
        description: "Entschuldigung wurde erfolgreich eingereicht.",
      });
      form.reset();
      clearSignature(); // Unterschrift zurücksetzen
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
    if (!user) return;

    const absenceData = {
      studentId: user.id,
      studentName: `${data.firstName} ${data.lastName}`,
      studentClass: data.studentClass,
      profession: data.profession,
      phonePrivate: data.phonePrivate || "",
      phoneWork: data.phoneWork || "",
      educationType: data.educationType || null,
      teacherId: 1,
      teacherName: data.teachers[0],
      teachers: data.teachers,
      absenceDate: data.absenceDate,
      absenceType: "Krankheit",
      reason: data.reason,
      dateStart: data.absenceDate,
      dateEnd: data.absenceDate,
      lessonCount: data.lessonCount || "0",
      location: data.location || "",
      parentSignature: data.parentSignature || false,
      supervisorSignature: data.supervisorSignature || false,
      signature: data.signature || "",
      submissionDate: getFormattedDate(new Date()),
      status: "pending",
    };

    console.log("Transformed absence data:", absenceData);
    submitMutation.mutate(absenceData);
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
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 col-span-2">
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
            </div>

            {
            /* <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 col-span-2">
              <FormField
                control={form.control}
                name="profession"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Beruf</FormLabel>
                    <FormControl>
                      <Select onValueChange={field.onChange} value={field.value}>
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
            
            <div className="flex items-center space-x-4">
              <FormField
                control={form.control}
                name="educationType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Schultyp</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Schultyp auswählen" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="BS">BS</SelectItem>
                        <SelectItem value="BM">BM</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
          
          {/* Grund der Abwesenheit */
          }
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ort</FormLabel>
                    <FormControl>
                      <Input placeholder="z.B. Basel" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Datum</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} value={field.value || ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="flex flex-col">
              <FormLabel className="mb-2">Unterschriften</FormLabel>
              <div className="grid grid-cols-1 gap-2">
                <div>
                  <div className="flex justify-between mb-1">
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
                  
                  {/* Signature Canvas */}
                  <FormField
                    control={form.control}
                    name="signature"
                    render={({ field }) => (
                      <FormItem>
                        <canvas
                          ref={canvasRef}
                          className="border border-gray-300 rounded w-full h-20 touch-none"
                          onMouseDown={() => setIsDrawing(true)}
                          onMouseUp={() => {
                            setIsDrawing(false);
                            // Save signature as data URL when mouse is released
                            const canvas = canvasRef.current;
                            if (canvas) {
                              const signatureData = canvas.toDataURL();
                              field.onChange(signatureData);
                            }
                          }}
                          onMouseMove={(e) => {
                            if (!isDrawing || !canvasRef.current) return;
                            const canvas = canvasRef.current;
                            const ctx = canvas.getContext('2d');
                            if (ctx) {
                              const rect = canvas.getBoundingClientRect();
                              const x = e.clientX - rect.left;
                              const y = e.clientY - rect.top;
                              ctx.lineWidth = 2;
                              ctx.lineCap = 'round';
                              ctx.strokeStyle = '#000';
                              ctx.lineTo(x, y);
                              ctx.stroke();
                              ctx.beginPath();
                              ctx.moveTo(x, y);
                            }
                          }}
                        ></canvas>
                        <div className="flex justify-end">
                          <Button 
                            type="button" 
                            variant="outline" 
                            size="sm"
                            className="mt-1 text-xs"
                            onClick={() => {
                              clearSignature();
                              field.onChange("");
                            }}
                          >
                            Löschen
                          </Button>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="parentSignature"
                  render={({ field }) => (
                    <FormItem className="flex items-center space-x-2">
                      <span className="flex-grow">Eltern</span>
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="supervisorSignature"
                  render={({ field }) => (
                    <FormItem className="flex items-center space-x-2">
                      <span className="flex-grow">Ausbildungsverantwortliche:r</span>
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
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
                      value={field.value[field.value.length - 1] || ""}
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
                        {field.value.map((teacher: string, index: number) => (
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
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                      <FormLabel className="mt-0">
                        Ich bestätige, dass alle Angaben wahrheitsgemäß sind und dass diese Entschuldigung mit den erforderlichen Unterschriften versehen wurde.
                      </FormLabel>
                    </div>
                  </FormControl>
                  <FormMessage />
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
