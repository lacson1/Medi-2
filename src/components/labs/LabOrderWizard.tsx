import React from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';

const schema = z.object({
  patientId: z.string().min(1, 'Patient is required'),
  testName: z.string().min(1, 'Test name is required'),
  priority: z.enum(['normal', 'urgent', 'stat']).default('normal'),
  instructions: z.string().optional(),
});

type WizardValues = z.infer<typeof schema>;

type LabOrderWizardProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export default function LabOrderWizard({ open, onOpenChange }: LabOrderWizardProps) {
  const [step, setStep] = React.useState(0);
  const methods = useForm<WizardValues>({ resolver: zodResolver(schema), defaultValues: { priority: 'normal' } });

  const steps = ['Patient', 'Test', 'Priority', 'Review'];
  const progress = ((step + 1) / steps.length) * 100;

  function next() {
    if (step < steps.length - 1) setStep((s) => s + 1);
  }
  function prev() {
    if (step > 0) setStep((s) => s - 1);
  }

  function onSubmit(values: WizardValues) {
    toast.success('Lab order created');
    onOpenChange(false);
    setStep(0);
    methods.reset();
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>New Lab Order</DialogTitle>
        </DialogHeader>
        <div className="pb-2">
          <Progress value={progress} />
          <div className="text-xs text-muted-foreground mt-2">Step {step + 1} of {steps.length}: {steps[step]}</div>
        </div>
        <FormProvider {...methods}>
          <form
            onSubmit={methods.handleSubmit(onSubmit)}
            className="space-y-4"
          >
            {step === 0 && (
              <div className="space-y-2">
                <label className="text-sm">Patient</label>
                <Input
                  placeholder="Enter Patient ID"
                  {...methods.register('patientId')}
                />
              </div>
            )}

            {step === 1 && (
              <div className="space-y-2">
                <label className="text-sm">Test Name</label>
                <Input placeholder="e.g., Complete Blood Count" {...methods.register('testName')} />
              </div>
            )}

            {step === 2 && (
              <div className="space-y-2">
                <label className="text-sm">Priority</label>
                <Select
                  onValueChange={(v) => methods.setValue('priority', v as any)}
                  defaultValue={methods.getValues('priority')}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                    <SelectItem value="stat">STAT</SelectItem>
                  </SelectContent>
                </Select>
                <label className="text-sm">Instructions</label>
                <Input placeholder="Optional instructions" {...methods.register('instructions')} />
              </div>
            )}

            {step === 3 && (
              <div className="space-y-1 text-sm">
                <div><span className="text-muted-foreground">Patient:</span> {methods.getValues('patientId') || '-'}</div>
                <div><span className="text-muted-foreground">Test:</span> {methods.getValues('testName') || '-'}</div>
                <div><span className="text-muted-foreground">Priority:</span> {methods.getValues('priority')}</div>
                <div><span className="text-muted-foreground">Instructions:</span> {methods.getValues('instructions') || '-'}</div>
              </div>
            )}

            <div className="flex items-center justify-between pt-2">
              <Button type="button" variant="outline" onClick={prev} disabled={step === 0}>Back</Button>
              {step < steps.length - 1 ? (
                <Button type="button" onClick={next}>Next</Button>
              ) : (
                <Button type="submit">Submit</Button>
              )}
            </div>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}


