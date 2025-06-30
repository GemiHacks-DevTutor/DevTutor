'use client'

import { useRouter } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import { useEffect } from 'react'

import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  RadioGroup,
  RadioGroupItem,
} from '@/components/ui/radio-group'
import { useUser } from '@/contexts/UserContext'

const FormSchema = z.object({
  style: z.enum(['descriptive', 'visual', 'analogy'], {
    required_error: 'You need to select a learning style.',
  }),
  tone: z.enum(['teacher', 'tutor', 'peer'], {
    required_error: 'You need to select a tone for your teacher.',
  }),
  pace: z.enum(['step-by-step', 'fail-fast'], {
    required_error: 'You need to select a learning pace.',
  }),
  experience: z.enum(['beginner', 'intermediate', 'advanced'], {
    required_error: 'You need to select your preferred experience.',
  }),
})

export default function QuestionnairePage() {
  const { user, submitQuestionnaire } = useUser()
  const router = useRouter()
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
  })

  // Redirect logic
  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    // If user has already completed questionnaire, redirect to dashboard
    if (user && user.hasCompletedSurvey) {
      router.push('/dashboard');
      return;
    }
  }, [user, router]);

  // Early returns for redirects
  if (!user) 
    return <div>Redirecting to login...</div>;
  

  if (user && user.hasCompletedSurvey) 
    return <div>Redirecting to dashboard...</div>;
  

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    // Mapping function
    const choiceToNumber = (field: string, value: string): number => {
      const options: Record<string, string[]> = {
        style: ['descriptive', 'visual', 'analogy'],
        tone: ['teacher', 'tutor', 'peer'],
        pace: ['step-by-step', 'fail-fast'],
        experience: ['beginner', 'intermediate', 'advanced'],
      }

      return options[field].indexOf(value)
    }

    // Convert all values
    const answers = {
      style: choiceToNumber('style', data.style),
      tone: choiceToNumber('tone', data.tone),
      pace: choiceToNumber('pace', data.pace),
      experience: choiceToNumber('experience', data.experience),
    }

    // Submit using UserContext
    const result = await submitQuestionnaire(answers);
    
    if (result.success) {
      toast.success('Preferences saved successfully!');
      router.push('/dashboard');
    } else 
      toast.error('Submission failed.', {
        description: result.error || 'An unknown error occurred.'
      });
    
  }

  return (
    <div className="bg-background text-foreground flex min-h-screen flex-col items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-2xl space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight">
            Learning Style Questionnaire
          </h1>
          <p className="text-muted-foreground">
            Tell us how you like to learn so we can tailor your experience.
          </p>
        </div>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-8"
          >
            <FormField
          control={form.control}
          name="style"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel>What is your preferred learning style?</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="flex flex-col space-y-1"
                >
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="descriptive" />
                    </FormControl>
                    <FormLabel className="font-normal">
                      Descriptive learner: I prefer detailed descriptions of what I am talking about
                    </FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="visual" />
                    </FormControl>
                    <FormLabel className="font-normal">
                      Visual learner: I prefer being able to picture what is going with detailed visual descriptions
                    </FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="analogy" />
                    </FormControl>
                    <FormLabel className="font-normal">
                        Analogy learner: I prefer learning by using analogies to simpler topics
                    </FormLabel>
                  </FormItem>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="tone"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel>What kind of tone do you prefer from your tutor?</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="flex flex-col space-y-1"
                >
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="teacher" />
                    </FormControl>
                    <FormLabel className="font-normal">
                      Teacher (formal, authoritative)
                    </FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="tutor" />
                    </FormControl>
                    <FormLabel className="font-normal">
                      Tutor (supportive, guiding)
                    </FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="peer" />
                    </FormControl>
                    <FormLabel className="font-normal">Peer (casual, collaborative)</FormLabel>
                  </FormItem>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="pace"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel>What learning pace do you prefer?</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="flex flex-col space-y-1"
                >
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="step-by-step" />
                    </FormControl>
                    <FormLabel className="font-normal">
                      Step-by-step (detailed, gradual)
                    </FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="fail-fast" />
                    </FormControl>
                    <FormLabel className="font-normal">
                      Fail-fast (learn by doing, quick iterations)
                    </FormLabel>
                  </FormItem>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="experience"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel>What is your programming experience level?</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="flex flex-col space-y-1"
                >
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="beginner" />
                    </FormControl>
                    <FormLabel className="font-normal">Beginner</FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="intermediate" />
                    </FormControl>
                    <FormLabel className="font-normal">Intermediate</FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="advanced" />
                    </FormControl>
                    <FormLabel className="font-normal">Advanced</FormLabel>
                  </FormItem>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
            <Button type="submit" className="w-full !mt-10">
              Submit Preferences
            </Button>
          </form>
        </Form>
      </div>
    </div>
  )
}
