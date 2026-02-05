import { useTheme } from "@/components/theme-provider"
import { Toaster as Sonner } from "sonner"

const Toaster = ({
  ...props
}) => {
  const { theme } = useTheme()

  return (
    <Sonner
      theme={theme === "system" ? undefined : theme}
      position="top-center"
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast font-sans group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg rounded-[var(--radius)]",
          description: "group-[.toast]:text-muted-foreground font-sans",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground font-sans",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground font-sans",
          title: "group-[.toast]:text-foreground font-sans",
          icon: "group-[.toast]:text-foreground",
        },
      }}
      {...props} />
  );
}

export { Toaster }
