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

export function showSuccess(title, description) {
  addToast({
    title: title,
    description: description,
    color: "success"
  })
}

export function showAuth() {
  addToast({
    title: 'Non sei autenticato',
    description: 'Verrai indirizzato alla pagina di login',
    color: 'warning',
    timeout: 5000,
    shouldShowTimeoutProgress: true,
    hideCloseButton: true
  })
}
