import { useState } from 'react'
import toast from 'react-hot-toast'

export function useCopyToClipboard() {
  const [copiedId, setCopiedId] = useState(null)

  const copy = async (text, id = 'default') => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedId(id)
      toast.success('Copiado para a área de transferência!')
      setTimeout(() => setCopiedId(null), 2000)
      return true
    } catch {
      toast.error('Não foi possível copiar. Tente manualmente.')
      return false
    }
  }

  const isCopied = (id = 'default') => copiedId === id

  return { copy, isCopied, copiedId }
}
