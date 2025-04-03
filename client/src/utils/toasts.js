import {
  addToast
} from "@heroui/react"

export function showError(title, description) {
  addToast({
    title: title,
    description: description,
    color: "danger"
  })
}
