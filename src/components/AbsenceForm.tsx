import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getFormattedDate } from "@/lib/utils";
import React, { useRef } from "react";
import { apiRequest } from "@/lib/queryClient";

export function AbsenceForm() {
  const { user } = useAuth();
  const { toast } = useToast();

  const defaultValues = {
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

  const form = useForm({
    defaultValues,
  });

  const signatureCanvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = React.useState(false);
  const [teachersSelected, setTeachersSelected] = React.useState<string[]>([]);

  // Canvas-Logik für Unterschrift
  function startDrawing(e: React.PointerEvent<HTMLCanvasElement>) {
    setIsDrawing(true);
    const canvas = signatureCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.beginPath();
    ctx.moveTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
  }
  function draw(e: React.PointerEvent<HTMLCanvasElement>) {
    if (!isDrawing) return;
    const canvas = signatureCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.lineTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
    ctx.stroke();
  }
  function stopDrawing() {
    setIsDrawing(false);
  }
  function clearSignature() {
    const canvas = signatureCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }

  // Multi-Select für Lehrpersonen
  const lehrerOptions = [
    "Herr Schmidt",
    "Frau Müller",
    "Herr Weber",
    "Frau Fischer",
  ];
  function addTeacher(e: React.ChangeEvent<HTMLSelectElement>) {
    const value = e.target.value;
    if (value && !teachersSelected.includes(value)) {
      setTeachersSelected([...teachersSelected, value]);
    }
    e.target.value = "";
  }
  function removeTeacher(name: string) {
    setTeachersSelected(teachersSelected.filter(t => t !== name));
  }

  async function onSubmit(data: any) {
    try {
      // Signatur als boolean (unterschrieben oder nicht)
      const canvas = signatureCanvasRef.current;
      let hasSignature = false;
      if (canvas) {
        const ctx = canvas.getContext("2d");
        if (ctx) {
          const pixelBuffer = new Uint32Array(
            ctx.getImageData(0, 0, canvas.width, canvas.height).data.buffer
          );
          hasSignature = pixelBuffer.some(color => color !== 0);
        }
      }
      const absenceData = {
        ...data,
        studentName: `${data.firstName} ${data.lastName}`.trim(),
        signature: hasSignature,
        teachers: teachersSelected,
        submissionDate: getFormattedDate(new Date()),
        status: "pending",
      };
      await apiRequest("POST", "/api/absences", absenceData);
      toast({
        title: "Erfolgreich eingereicht!",
        description: "Die Entschuldigung wurde erfolgreich gespeichert und wird nun geprüft.",
        variant: "default",
      });
      form.reset();
      setTeachersSelected([]);
      clearSignature();
    } catch (err: any) {
      toast({
        title: "Fehler",
        description: err?.message || "Abspeichern fehlgeschlagen.",
        variant: "destructive",
      });
    }
  }

  return (
    <Card className="bg-white shadow-md rounded-lg p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-2">Entschuldigung</h1>
      <div className="flex justify-between items-start mb-4">
        <p className="text-gray-700 text-sm max-w-xl">
          Schulversäumnisse sind innert 8, spätestens jedoch innert 14 Tagen bei den betreffenden Klassenlehrpersonen zu entschuldigen. Diese Entschuldigung ist ohne die erforderlichen Unterschriften ungültig.
        </p>
        <div className="text-right">
          <span className="font-bold text-2xl">BBB</span><br />
          <span className="text-xs">Berufsfachschule</span>
        </div>
      </div>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Persönliche Informationen */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label className="block font-medium mb-1">Name</label>
            <Input placeholder="Nachname" {...form.register("lastName", { required: true })} />
            {form.formState.errors.lastName && (<div className="text-red-500 text-sm mt-1">Nachname ist erforderlich</div>)}
          </div>
          <div>
            <label className="block font-medium mb-1">Vorname</label>
            <Input placeholder="Vorname" {...form.register("firstName", { required: true })} />
            {form.formState.errors.firstName && (<div className="text-red-500 text-sm mt-1">Vorname ist erforderlich</div>)}
          </div>
          <div>
            <label className="block font-medium mb-1">Klasse</label>
            <select className="border rounded px-3 py-2 w-full text-base" {...form.register("studentClass", { required: true })}>
              <option value="">Klasse auswählen</option>
              <option value="1A">1A</option>
              <option value="1B">1B</option>
              <option value="2A">2A</option>
              <option value="2B">2B</option>
            </select>
            {form.formState.errors.studentClass && (<div className="text-red-500 text-sm mt-1">Klasse ist erforderlich</div>)}
          </div>
          <div>
            <label className="block font-medium mb-1">Beruf</label>
            <select className="border rounded px-3 py-2 w-full text-base" {...form.register("profession", { required: true })}>
              <option value="">Beruf auswählen</option>
              <option value="Informatiker/in">Informatiker/in</option>
              <option value="Kaufmann/-frau">Kaufmann/-frau</option>
              <option value="Mediamatiker/in">Mediamatiker/in</option>
            </select>
            {form.formState.errors.profession && (<div className="text-red-500 text-sm mt-1">Beruf ist erforderlich</div>)}
          </div>
          <div>
            <label className="block font-medium mb-1">Telefon P</label>
            <Input placeholder="Private Telefonnummer" {...form.register("phonePrivate")} />
          </div>
          <div>
            <label className="block font-medium mb-1">Telefon G</label>
            <Input placeholder="Geschäftliche Telefonnummer" {...form.register("phoneWork")} />
          </div>
          <div>
            <label className="block font-medium mb-1">Schultyp</label>
            <select className="border rounded px-3 py-2 w-full text-base" {...form.register("educationType")}> 
              <option value="BS">BS</option>
              <option value="BM">BM</option>
            </select>
          </div>
        </div>
        {/* Grund der Abwesenheit */}
        <div className="border-t border-b border-gray-200 py-4">
          <label className="block font-medium mb-1">Grund</label>
          <textarea className="border rounded px-3 py-2 w-full text-base" rows={4} {...form.register("reason", { required: true })} />
          {form.formState.errors.reason && (<div className="text-red-500 text-sm mt-1">Grund ist erforderlich</div>)}
        </div>
        {/* Ort, Datum, Unterschriften */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label className="block font-medium mb-1">Ort</label>
            <Input placeholder="z.B. Basel" {...form.register("location", { required: true })} />
            {form.formState.errors.location && (<div className="text-red-500 text-sm mt-1">Ort ist erforderlich</div>)}
          </div>
          <div>
            <label className="block font-medium mb-1">Datum</label>
            <Input type="date" {...form.register("date", { required: true })} />
            {form.formState.errors.date && (<div className="text-red-500 text-sm mt-1">Datum ist erforderlich</div>)}
          </div>
          <div>
            <label className="block font-medium mb-1">Unterschriften</label>
            <div className="flex items-center gap-2 mb-2">
              <Checkbox checked={form.watch("isLegal")} onCheckedChange={v => form.setValue("isLegal", !!v)} id="isLegal" />
              <label htmlFor="isLegal">mündig</label>
            </div>
            <div>
              <label className="block text-xs mb-1">Lernende:r</label>
              <canvas
                ref={signatureCanvasRef}
                width={300}
                height={80}
                className="border rounded bg-white w-full h-20 cursor-crosshair"
                onPointerDown={startDrawing}
                onPointerMove={draw}
                onPointerUp={stopDrawing}
                onPointerLeave={stopDrawing}
              />
              <Button type="button" variant="outline" className="mt-2" onClick={clearSignature}>Löschen</Button>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <Checkbox checked={form.watch("parentSignature")} onCheckedChange={v => form.setValue("parentSignature", !!v)} id="parentSignature" />
              <label htmlFor="parentSignature">Eltern</label>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <Checkbox checked={form.watch("supervisorSignature")} onCheckedChange={v => form.setValue("supervisorSignature", !!v)} id="supervisorSignature" />
              <label htmlFor="supervisorSignature">Ausbildungsverantwortliche:r</label>
            </div>
          </div>
        </div>
        {/* Versäumter Unterricht */}
        <div className="border-t border-gray-200 pt-4">
          <h2 className="text-lg font-semibold mb-4">Ich habe folgenden Unterricht bei folgenden Lehrpersonen versäumt:</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 mb-4">
            <div>
              <label className="block font-medium mb-1">Lehrperson</label>
              <select className="border rounded px-3 py-2 w-full text-base" onChange={addTeacher} defaultValue="">
                <option value="">Lehrpersonen auswählen</option>
                {lehrerOptions.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
              <div className="mt-2 flex flex-wrap gap-2">
                {teachersSelected.map(name => (
                  <span key={name} className="bg-gray-100 border rounded px-2 py-1 flex items-center text-sm">
                    {name}
                    <button type="button" className="ml-1 text-red-500" onClick={() => removeTeacher(name)}>&times;</button>
                  </span>
                ))}
              </div>
            </div>
            <div>
              <label className="block font-medium mb-1">Datum der Absenz</label>
              <Input type="date" {...form.register("absenceDate", { required: false })} />
            </div>
            <div>
              <label className="block font-medium mb-1">Anzahl Lektionen</label>
              <Input type="number" min="1" {...form.register("lessonCount", { required: false })} />
            </div>
          </div>
        </div>
        {/* Bestätigung */}
        <div className="pt-2">
          <div className="flex items-center gap-2">
            <Checkbox checked={form.watch("confirmTruth")} onCheckedChange={v => form.setValue("confirmTruth", !!v)} id="confirmTruth" />
            <label htmlFor="confirmTruth">Ich bestätige, dass alle Angaben wahrheitsgemäß sind und dass diese Entschuldigung mit den erforderlichen Unterschriften versehen wurde.</label>
            {form.formState.errors.confirmTruth && (<div className="text-red-500 text-sm mt-1">Bestätigung ist erforderlich</div>)}
          </div>
        </div>
        <div className="mt-6 flex justify-end">
          <Button type="submit" className="px-6 py-2">Entschuldigung einreichen</Button>
        </div>
      </form>
    </Card>
  );
}
