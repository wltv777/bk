'use client';

import { useState } from 'react';
import { Shield, ChevronLeft, Trash2, Download, Eye, EyeOff, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { auth } from '@/lib/firebase';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useUserStore } from '@/store/userStore';
import toast from 'react-hot-toast';

export default function PrivacyPage() {
  const router = useRouter();
  const { logout } = useAuth();
  const { clearUser } = useUserStore();
  const [profileVisible, setProfileVisible] = useState(true);
  const [rankingVisible, setRankingVisible] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  function exportData() {
    const uid = auth.currentUser?.uid;
    const data = {
      userId: uid,
      exportedAt: new Date().toISOString(),
      note: 'Seus dados do METAFOCO. Para exportar histórico completo, acesse o app e vá em Progresso.',
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `metafoco_dados_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Dados exportados!');
  }

  async function deleteAccount() {
    try {
      // Sign out and clear local data (in a real app: also delete Firestore docs)
      clearUser();
      await logout();
      toast.success('Conta removida dos dados locais.');
      router.replace('/login');
    } catch {
      toast.error('Erro ao excluir. Contate o suporte.');
    }
  }

  return (
    <div className="min-h-screen bg-black pb-24">
      <div className="px-5 pt-12 pb-4">
        <Link href="/settings" className="flex items-center gap-2 text-white/40 text-sm mb-4 hover:text-white/60 transition-colors">
          <ChevronLeft className="w-4 h-4" /> Voltar
        </Link>
        <div className="flex items-center gap-2 mb-1">
          <Shield className="w-5 h-5 text-primary" />
          <h1 className="section-title text-2xl">Privacidade</h1>
        </div>
        <p className="text-white/40 text-sm">Controle seus dados e visibilidade</p>
      </div>

      <div className="px-5 space-y-4">
        {/* Visibility settings */}
        <div className="card space-y-4">
          <h3 className="font-semibold text-white text-sm">Visibilidade</h3>

          <div className="flex items-center gap-3">
            <Eye className="w-4 h-4 text-white/40" />
            <div className="flex-1">
              <div className="text-white text-sm">Perfil na comunidade</div>
              <div className="text-white/30 text-xs">Seus desafios aparecem para outros usuários</div>
            </div>
            <PrivacyToggle value={profileVisible} onChange={setProfileVisible} />
          </div>

          <div className="flex items-center gap-3">
            <Eye className="w-4 h-4 text-white/40" />
            <div className="flex-1">
              <div className="text-white text-sm">Aparecer no ranking</div>
              <div className="text-white/30 text-xs">Exibir XP e nível nas competições</div>
            </div>
            <PrivacyToggle value={rankingVisible} onChange={setRankingVisible} />
          </div>
        </div>

        {/* Data section */}
        <div className="card space-y-3">
          <h3 className="font-semibold text-white text-sm">Seus dados</h3>
          <p className="text-white/40 text-xs leading-relaxed">
            O METAFOCO armazena seus dados de saúde (peso, macros, treinos) apenas para uso pessoal. Nunca compartilhamos com terceiros.
          </p>

          <button
            onClick={exportData}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-white/10 text-white/60 hover:border-primary/30 hover:text-white/80 transition-colors text-sm"
          >
            <Download className="w-4 h-4" />
            Exportar meus dados
          </button>
        </div>

        {/* Delete account */}
        <div className="card border-danger/20">
          <h3 className="font-semibold text-danger text-sm mb-2 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" /> Excluir conta
          </h3>
          <p className="text-white/40 text-xs mb-3 leading-relaxed">
            Remover permanentemente todos os seus dados. Esta ação não pode ser desfeita.
          </p>

          {!showDeleteConfirm ? (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-danger/30 text-danger hover:bg-danger/10 transition-colors text-sm"
            >
              <Trash2 className="w-4 h-4" />
              Excluir minha conta
            </button>
          ) : (
            <div className="space-y-2">
              <p className="text-danger text-xs text-center font-semibold">Tem certeza? Isso é irreversível.</p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="py-2.5 rounded-xl border border-white/10 text-white/50 text-sm hover:bg-white/5 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={deleteAccount}
                  className="py-2.5 rounded-xl bg-danger/20 border border-danger text-danger text-sm font-bold hover:bg-danger/30 transition-colors"
                >
                  Confirmar
                </button>
              </div>
            </div>
          )}
        </div>

        <p className="text-center text-white/20 text-xs">
          Dúvidas? Contate <span className="text-primary">suporte@metafoco.app</span>
        </p>
      </div>
    </div>
  );
}

function PrivacyToggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!value)}
      className={cn(
        'w-12 h-6 rounded-full transition-all duration-300 relative flex-shrink-0',
        value ? 'bg-primary' : 'bg-white/10'
      )}
    >
      <div
        className={cn(
          'w-5 h-5 rounded-full bg-white shadow-sm absolute top-0.5 transition-all duration-300',
          value ? 'left-6' : 'left-0.5'
        )}
      />
    </button>
  );
}
