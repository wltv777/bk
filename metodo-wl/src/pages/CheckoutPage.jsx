import { useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { CreditCard, Lock, Shield, CheckCircle, Zap, ChevronDown } from 'lucide-react'
import { BONUSES } from '../data/courseData'
import toast from 'react-hot-toast'

function CardInput({ label, placeholder, value, onChange, type = 'text', maxLength }) {
  return (
    <div>
      <label className="text-sm font-medium text-wl-gray block mb-2">{label}</label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        maxLength={maxLength}
        className="input-wl"
      />
    </div>
  )
}

export default function CheckoutPage() {
  const navigate = useNavigate()
  const [payMethod, setPayMethod] = useState('card')
  const [loading, setLoading] = useState(false)
  const [card, setCard] = useState({ number: '', name: '', expiry: '', cvv: '' })
  const [installments, setInstallments] = useState('1')

  const formatCard = (val) => val.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim().slice(0, 19)
  const formatExpiry = (val) => val.replace(/\D/g, '').replace(/(\d{2})(\d)/, '$1/$2').slice(0, 5)

  const handlePurchase = async (e) => {
    e.preventDefault()
    if (payMethod === 'card' && (!card.number || !card.name || !card.expiry || !card.cvv)) {
      toast.error('Preencha todos os dados do cartão')
      return
    }
    setLoading(true)
    await new Promise(r => setTimeout(r, 2000))
    setLoading(false)
    toast.success('Pagamento aprovado! 🎉')
    navigate('/obrigado')
  }

  const installmentOptions = [
    { v: '1', label: '1x de R$ 497,00 (à vista)' },
    { v: '2', label: '2x de R$ 253,50' },
    { v: '3', label: '3x de R$ 169,00' },
    { v: '6', label: '6x de R$ 85,83' },
    { v: '10', label: '10x de R$ 52,47' },
    { v: '12', label: '12x de R$ 44,07' },
  ]

  return (
    <div className="min-h-screen bg-wl-black" style={{ background: 'radial-gradient(ellipse at top, rgba(0,102,255,0.07) 0%, transparent 50%), var(--wl-black)' }}>
      {/* Header */}
      <header className="py-4 px-6 border-b border-wl-border flex items-center justify-between" style={{ background: 'rgba(8,8,16,0.9)', backdropFilter: 'blur(20px)' }}>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#0066ff,#7c3aed)' }}>
            <Zap size={16} className="text-white" />
          </div>
          <span className="font-black text-white">MÉTODO WL</span>
        </div>
        <div className="flex items-center gap-4 text-sm text-wl-gray">
          <span className="flex items-center gap-1.5"><Lock size={13} className="text-green-400" /> Checkout seguro</span>
          <span className="flex items-center gap-1.5"><Shield size={13} className="text-wl-blue" /> SSL 256-bit</span>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-12 grid lg:grid-cols-5 gap-8">
        {/* Form */}
        <div className="lg:col-span-3">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <h1 className="text-2xl font-black text-white mb-8">Finalizar compra</h1>

            {/* Payment method tabs */}
            <div className="flex gap-3 mb-8">
              {[
                { id: 'card', icon: '💳', label: 'Cartão' },
                { id: 'pix', icon: '⚡', label: 'Pix' },
                { id: 'boleto', icon: '🔖', label: 'Boleto' },
              ].map(m => (
                <button key={m.id} onClick={() => setPayMethod(m.id)}
                  className={`flex-1 py-3 rounded-xl text-sm font-medium transition-all border flex items-center justify-center gap-2 ${
                    payMethod === m.id
                      ? 'bg-wl-blue/15 border-wl-blue text-white'
                      : 'border-wl-border text-wl-gray hover:border-wl-blue/40'
                  }`}>
                  {m.icon} {m.label}
                </button>
              ))}
            </div>

            <form onSubmit={handlePurchase} className="space-y-5">
              {/* Personal info */}
              <div className="card-wl p-6 space-y-4">
                <h3 className="font-bold text-white text-sm uppercase tracking-wider mb-4">Dados pessoais</h3>
                <div className="grid grid-cols-2 gap-4">
                  <CardInput label="Nome completo" placeholder="Como no cartão" value={card.name} onChange={e => setCard({ ...card, name: e.target.value })} />
                  <CardInput label="CPF" placeholder="000.000.000-00" value={card.number} onChange={e => setCard({ ...card, number: e.target.value })} />
                </div>
                <CardInput label="E-mail" placeholder="seu@email.com" value={card.expiry} onChange={e => setCard({ ...card, expiry: e.target.value })} type="email" />
              </div>

              {payMethod === 'card' && (
                <div className="card-wl p-6 space-y-4">
                  <h3 className="font-bold text-white text-sm uppercase tracking-wider mb-4 flex items-center gap-2">
                    <CreditCard size={16} className="text-wl-blue" />
                    Dados do cartão
                  </h3>
                  <CardInput
                    label="Número do cartão"
                    placeholder="0000 0000 0000 0000"
                    value={card.number}
                    onChange={e => setCard({ ...card, number: formatCard(e.target.value) })}
                    maxLength={19}
                  />
                  <CardInput
                    label="Nome no cartão"
                    placeholder="Como impresso no cartão"
                    value={card.name}
                    onChange={e => setCard({ ...card, name: e.target.value.toUpperCase() })}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <CardInput
                      label="Validade"
                      placeholder="MM/AA"
                      value={card.expiry}
                      onChange={e => setCard({ ...card, expiry: formatExpiry(e.target.value) })}
                      maxLength={5}
                    />
                    <CardInput
                      label="CVV"
                      placeholder="000"
                      value={card.cvv}
                      onChange={e => setCard({ ...card, cvv: e.target.value.replace(/\D/g, '').slice(0, 4) })}
                      maxLength={4}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-wl-gray block mb-2">Parcelamento</label>
                    <div className="relative">
                      <select
                        value={installments}
                        onChange={e => setInstallments(e.target.value)}
                        className="input-wl appearance-none pr-10 cursor-pointer"
                      >
                        {installmentOptions.map(o => (
                          <option key={o.v} value={o.v}>{o.label}</option>
                        ))}
                      </select>
                      <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-wl-gray pointer-events-none" />
                    </div>
                  </div>
                </div>
              )}

              {payMethod === 'pix' && (
                <div className="card-wl p-8 text-center">
                  <div className="w-40 h-40 rounded-xl mx-auto mb-4 flex items-center justify-center" style={{ background: 'rgba(0,102,255,0.1)', border: '2px dashed rgba(0,102,255,0.3)' }}>
                    <span className="text-5xl">⚡</span>
                  </div>
                  <p className="text-white font-bold mb-2">Pague com Pix e ganhe 5% de desconto!</p>
                  <p className="text-wl-gray text-sm mb-2">Após clicar no botão, o QR Code será gerado</p>
                  <p className="text-wl-gold font-bold text-xl">R$ 472,15 à vista</p>
                </div>
              )}

              {payMethod === 'boleto' && (
                <div className="card-wl p-6 text-center">
                  <span className="text-4xl block mb-4">🔖</span>
                  <p className="text-white font-bold mb-2">Boleto bancário</p>
                  <p className="text-wl-gray text-sm">O boleto vence em 3 dias úteis. O acesso é liberado após a compensação.</p>
                </div>
              )}

              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: loading ? 1 : 1.02 }}
                whileTap={{ scale: loading ? 1 : 0.98 }}
                className="btn-gold w-full text-lg flex items-center justify-center gap-3 py-5"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                    Processando pagamento...
                  </>
                ) : (
                  <>
                    <Lock size={20} />
                    Finalizar compra segura
                    <Zap size={20} />
                  </>
                )}
              </motion.button>
            </form>

            <div className="flex items-center justify-center gap-6 mt-6 text-xs text-wl-gray">
              <span>🔒 SSL 256-bit</span>
              <span>🛡️ Dados seguros</span>
              <span>✅ Pagamento criptografado</span>
            </div>
          </motion.div>
        </div>

        {/* Order summary */}
        <div className="lg:col-span-2">
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
            <div className="card-premium p-6 sticky top-8">
              <h2 className="font-bold text-white mb-6 text-lg">Resumo do pedido</h2>

              {/* Product */}
              <div className="flex items-start gap-3 mb-6 pb-6 border-b border-wl-border">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'linear-gradient(135deg,#0066ff,#7c3aed)' }}>
                  <Zap size={22} className="text-white" />
                </div>
                <div>
                  <p className="text-white font-bold">MÉTODO WL — Premium</p>
                  <p className="text-wl-gray text-sm">12 módulos + 6 bônus + IA</p>
                  <p className="text-xs text-wl-blue mt-1">Acesso vitalício</p>
                </div>
              </div>

              {/* What's included */}
              <div className="space-y-3 mb-6">
                {[
                  '12 Módulos completos (100+ aulas)',
                  'IA Assistente WL ilimitada',
                  'Gerador de Reels Virais',
                  'Analisador de Instagram com IA',
                  'Comunidade VIP exclusiva',
                  'Biblioteca de 500+ prompts',
                  ...BONUSES.slice(0, 2).map(b => `Bônus: ${b.title}`),
                ].map(item => (
                  <div key={item} className="flex items-center gap-2 text-sm">
                    <CheckCircle size={14} className="text-green-400 shrink-0" />
                    <span className="text-wl-gray">{item}</span>
                  </div>
                ))}
              </div>

              {/* Pricing */}
              <div className="border-t border-wl-border pt-6 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-wl-gray">Subtotal</span>
                  <span className="text-wl-gray line-through">R$ 997,00</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-wl-gray">Desconto</span>
                  <span className="text-green-400">- R$ 500,00</span>
                </div>
                <div className="flex justify-between font-black text-lg pt-2 border-t border-wl-border">
                  <span className="text-white">Total</span>
                  <span className="gradient-text">R$ 497,00</span>
                </div>
              </div>

              {/* Guarantee */}
              <div className="mt-6 p-4 rounded-xl text-center" style={{ background: 'rgba(34,197,94,0.05)', border: '1px solid rgba(34,197,94,0.15)' }}>
                <Shield size={24} className="text-green-400 mx-auto mb-2" />
                <p className="text-green-400 font-bold text-sm">Garantia 7 dias</p>
                <p className="text-wl-gray text-xs mt-1">100% do dinheiro de volta se não satisfeito</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
