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
            "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-muted-foreground",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
          title: "group-[.toast]:text-foreground",
          icon: "group-[.toast]:text-foreground",
        },
      }}
      {...props} />
  );
}

export { Toaster }
