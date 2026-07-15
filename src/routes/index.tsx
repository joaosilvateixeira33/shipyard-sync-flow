import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useRef, useState } from "react";
import {
  Anchor,
  UploadCloud,
  FileText,
  Image as ImageIcon,
  Mail,
  Send,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  X,
  Ship,
} from "lucide-react";

export const Route = createFileRoute("/")({
  component: Dashboard,
});

// 🔗 Substitua esta URL pelo endpoint do seu webhook (Make/Zapier/n8n/etc.)
const WEBHOOK_URL = "https://hook.us2.make.com/dtwj0j85ynzayttrmmiixld4qgj2io85";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const handleFormSubmit = async (
  email: string,
  file: File,
): Promise<{ ok: boolean; data?: unknown; error?: string }> => {
  const formData = new FormData();
  formData.append("email", email);
  formData.append("file", file);

  try {
    const response = await fetch(WEBHOOK_URL, {
      method: "POST",
      body: formData,
    });
    if (!response.ok) {
      return { ok: false, error: `Erro ${response.status}` };
    }
    let data: unknown = null;
    try {
      data = await response.json();
    } catch {
      // webhook can return plain text
    }
    return { ok: true, data };
  } catch (error) {
    console.error("Erro ao enviar para o Make:", error);
    return { ok: false, error: (error as Error).message };
  }
};

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function Dashboard() {
  const [file, setFile] = useState<File | null>(null);
  const [email, setEmail] = useState("");
  const [emailTouched, setEmailTouched] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; msg: string } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const emailValid = emailRegex.test(email.trim());
  const canSubmit = !!file && emailValid && !submitting;

  const acceptFile = useCallback((f: File) => {
    const ok =
      f.type === "application/pdf" ||
      f.type.startsWith("image/") ||
      /\.(pdf|png|jpg|jpeg|webp)$/i.test(f.name);
    if (!ok) {
      setFeedback({ type: "error", msg: "Formato inválido. Envie PDF ou imagem." });
      return;
    }
    setFile(f);
    setFeedback(null);
  }, []);

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files?.[0];
    if (f) acceptFile(f);
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !emailValid) return;
    setSubmitting(true);
    setFeedback(null);

    const result = await handleFormSubmit(email.trim(), file);

    if (result.ok) {
      setFeedback({
        type: "success",
        msg: "Relatório processado e enviado com sucesso.",
      });
    } else {
      setFeedback({
        type: "error",
        msg: result.error ?? "Falha ao enviar. Tente novamente.",
      });
    }
    setSubmitting(false);
  };

  const FileIcon = file?.type.startsWith("image/") ? ImageIcon : FileText;

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-border bg-[image:var(--gradient-primary)] text-primary-foreground">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-5 sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-white/10 ring-1 ring-white/20 backdrop-blur">
              <Anchor className="h-6 w-6" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-xs uppercase tracking-[0.2em] text-white/70">
                Wilson Sons · Estaleiro
              </p>
              <h1 className="truncate text-lg font-semibold sm:text-xl">
                Painel de Operações
              </h1>
            </div>
          </div>
          <div className="hidden items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-medium ring-1 ring-white/20 sm:flex">
            <Ship className="h-4 w-4" />
            <span>Sistema Operacional</span>
            <span className="ml-1 h-2 w-2 rounded-full bg-success" />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Intro */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Processamento de Documentos do Estaleiro
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground sm:text-base">
            Envie plantas, manifestos ou fotos de inspeção. O sistema processa o
            documento e envia o relatório de peças e status de estoque para o
            e-mail informado.
          </p>
        </section>

        {/* Steps */}
        <ol className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
          {[
            { n: 1, t: "Enviar arquivo", d: "PDF ou imagem" },
            { n: 2, t: "Informar e-mail", d: "Destino do relatório" },
            { n: 3, t: "Processar & enviar", d: "Envio automático" },
          ].map((s) => (
            <li
              key={s.n}
              className="flex items-center gap-3 rounded-xl border border-border bg-card p-3 shadow-[var(--shadow-soft)]"
            >
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-primary text-primary-foreground text-sm font-semibold">
                {s.n}
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{s.t}</p>
                <p className="truncate text-xs text-muted-foreground">{s.d}</p>
              </div>
            </li>
          ))}
        </ol>

        <form
          onSubmit={onSubmit}
          className="grid grid-cols-1 gap-6 lg:grid-cols-5"
        >
          {/* Upload */}
          <div className="lg:col-span-3">
            <div className="rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-soft)] sm:p-6">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                  Documento
                </h3>
                {file && (
                  <button
                    type="button"
                    onClick={() => {
                      setFile(null);
                      if (inputRef.current) inputRef.current.value = "";
                    }}
                    className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive"
                  >
                    <X className="h-3.5 w-3.5" /> Remover
                  </button>
                )}
              </div>

              <label
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOver(true);
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={onDrop}
                className={`group relative flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 text-center transition-colors sm:p-12 ${
                  dragOver
                    ? "border-primary bg-primary/5"
                    : "border-border bg-[image:var(--gradient-surface)] hover:border-primary/50 hover:bg-primary/[0.03]"
                }`}
              >
                <input
                  ref={inputRef}
                  type="file"
                  accept="application/pdf,image/*"
                  className="sr-only"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) acceptFile(f);
                  }}
                />
                {!file ? (
                  <>
                    <div className="mb-3 grid h-14 w-14 place-items-center rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/20">
                      <UploadCloud className="h-7 w-7" />
                    </div>
                    <p className="text-sm font-medium">
                      Arraste e solte o arquivo aqui
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      ou clique para selecionar · PDF, PNG, JPG (até 20 MB)
                    </p>
                  </>
                ) : (
                  <div className="flex w-full min-w-0 items-center gap-4 text-left">
                    <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/20">
                      <FileIcon className="h-7 w-7" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{file.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatBytes(file.size)} ·{" "}
                        {file.type || "arquivo"}
                      </p>
                    </div>
                    <span className="hidden shrink-0 rounded-full bg-success/10 px-2.5 py-1 text-xs font-medium text-success ring-1 ring-success/20 sm:inline-flex">
                      Pronto
                    </span>
                  </div>
                )}
              </label>
            </div>
          </div>

          {/* Email + submit */}
          <div className="lg:col-span-2">
            <div className="flex h-full flex-col justify-between rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-soft)] sm:p-6">
              <div>
                <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                  Destinatário
                </h3>
                <label htmlFor="email" className="text-sm font-medium">
                  E-mail para envio do relatório
                </label>
                <div className="relative mt-2">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    id="email"
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onBlur={() => setEmailTouched(true)}
                    placeholder="operacoes@wilsonsons.com.br"
                    className={`w-full rounded-lg border bg-background py-2.5 pl-9 pr-3 text-sm outline-none transition focus:ring-2 ${
                      emailTouched && !emailValid
                        ? "border-destructive/60 focus:ring-destructive/30"
                        : "border-input focus:border-primary focus:ring-primary/20"
                    }`}
                  />
                </div>
                {emailTouched && !emailValid && (
                  <p className="mt-1.5 flex items-center gap-1 text-xs text-destructive">
                    <AlertTriangle className="h-3.5 w-3.5" /> Informe um e-mail
                    válido.
                  </p>
                )}
              </div>

              <div className="mt-6">
                <button
                  type="submit"
                  disabled={!canSubmit}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[image:var(--gradient-primary)] px-4 py-3 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-elegant)] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Processando documento…
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      Processar & Enviar Relatório
                    </>
                  )}
                </button>
                {feedback && (
                  <div
                    className={`mt-3 flex items-start gap-2 rounded-lg px-3 py-2 text-xs ring-1 ${
                      feedback.type === "success"
                        ? "bg-success/10 text-success ring-success/20"
                        : "bg-destructive/10 text-destructive ring-destructive/20"
                    }`}
                  >
                    {feedback.type === "success" ? (
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
                    ) : (
                      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                    )}
                    <span>{feedback.msg}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </form>

        <footer className="mt-12 border-t border-border pt-6 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} Wilson Sons · Sistema de Gestão do Estaleiro
        </footer>
      </main>
    </div>
  );
}
