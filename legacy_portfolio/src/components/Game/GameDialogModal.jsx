import { useEffect, useState } from "react";
import { FaExternalLinkAlt, FaGithub, FaFilePdf, FaTimes, FaEnvelope, FaPhoneAlt, FaLinkedin, FaMapMarkerAlt } from "react-icons/fa";
import { sound } from "./soundEngine";

function GameDialogModal({ item, onClose, onSwitchToClassic }) {
  const [showLivePreview, setShowLivePreview] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" || e.key === "e" || e.key === "E") {
        sound.playClose();
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  if (!item) return null;
  const { dialogue } = item;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-md animate-fadeIn">
      <div
        role="dialog"
        aria-modal="true"
        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl border border-gold-500/50 bg-slate-950/95 p-6 sm:p-8 text-slate-100 shadow-2xl backdrop-blur-xl"
      >
        {/* Top Header */}
        <div className="flex items-start justify-between gap-4 border-b border-brand-800/50 pb-4">
          <div className="flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-gold-500/60 bg-slate-900 text-2xl shadow">
              {item.avatar === "/photo.jpeg" ? (
                <img
                  src="/photo.jpeg"
                  alt="Avatar"
                  className="h-full w-full rounded-2xl object-cover"
                  onError={(e) => (e.currentTarget.src = "/sarthak-photo.png")}
                />
              ) : (
                item.icon
              )}
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-extrabold text-slate-100 font-heading">
                  {item.name}
                </h3>
                <span className="rounded-full border border-gold-500/60 bg-gold-500/10 px-2.5 py-0.5 text-[10px] font-bold text-gold-400">
                  {item.badge}
                </span>
              </div>
              <p className="text-xs text-gold-300/90 mt-0.5">{item.title}</p>
            </div>
          </div>

          <button
            onClick={() => {
              sound.playClose();
              onClose();
            }}
            aria-label="Close dialogue"
            className="rounded-full border border-slate-700 bg-slate-900 p-2 text-slate-400 hover:border-gold-500 hover:text-white transition"
          >
            <FaTimes size={15} />
          </button>
        </div>

        {/* Content Body based on Category */}
        <div className="mt-5 space-y-4">
          {/* Headline & Subtitle */}
          <div>
            <h4 className="text-lg font-bold text-gold-400 font-heading">
              {dialogue.headline}
            </h4>
            {dialogue.subtitle && (
              <p className="text-xs font-medium text-slate-400 mt-1">
                {dialogue.subtitle}
              </p>
            )}
          </div>

          {/* Body Paragraphs */}
          {dialogue.body && (
            <div className="space-y-2 text-sm leading-relaxed text-slate-300">
              {dialogue.body.map((para, i) => (
                <p key={i}>{para}</p>
              ))}
            </div>
          )}

          {/* Stats (About Sarthak) */}
          {dialogue.stats && (
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 pt-2">
              {dialogue.stats.map((st, i) => (
                <div key={i} className="rounded-xl border border-slate-800 bg-slate-900/80 p-3 text-center">
                  <p className="text-[10px] font-semibold text-slate-400 uppercase">{st.label}</p>
                  <p className="mt-1 text-xs font-bold text-gold-300">{st.value}</p>
                </div>
              ))}
            </div>
          )}

          {/* Skills used in experience */}
          {dialogue.skillsUsed && (
            <div className="pt-2">
              <p className="text-xs font-semibold text-slate-400 mb-1.5">Mastered Technologies:</p>
              <div className="flex flex-wrap gap-1.5">
                {dialogue.skillsUsed.map((sk) => (
                  <span key={sk} className="rounded-md border border-brand-700/60 bg-slate-900 px-2.5 py-1 text-xs font-medium text-gold-300">
                    {sk}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Project Action Links */}
          {(dialogue.liveUrl || dialogue.githubUrl) && (
            <div className="flex flex-col gap-3 pt-3">
              <div className="flex flex-wrap gap-2.5">
                {dialogue.liveUrl && (
                  <button
                    type="button"
                    onClick={() => setShowLivePreview((prev) => !prev)}
                    className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-5 py-2.5 text-xs font-bold text-white shadow-lg hover:brightness-110 transition"
                  >
                    <span>{showLivePreview ? "Hide Live Application" : "⚡ Test Live App in Citadel"}</span>
                  </button>
                )}
                {dialogue.liveUrl && (
                  <a
                    href={dialogue.liveUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-5 py-2.5 text-xs font-bold text-white shadow hover:bg-brand-500 transition"
                  >
                    <span>Open in New Tab</span>
                    <FaExternalLinkAlt size={11} />
                  </a>
                )}
                {dialogue.githubUrl && (
                  <a
                    href={dialogue.githubUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-5 py-2.5 text-xs font-bold text-slate-200 hover:border-gold-500 hover:text-white transition"
                  >
                    <FaGithub size={13} />
                    <span>GitHub Code</span>
                  </a>
                )}
              </div>

              {/* Live Embedded Preview inside Citadel Game */}
              {showLivePreview && dialogue.liveUrl && (
                <div className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950 overflow-hidden shadow-2xl animate-fadeIn ring-1 ring-emerald-500/40">
                  <div className="flex items-center justify-between bg-slate-900 px-4 py-2 text-[11px] text-slate-300 border-b border-slate-800">
                    <span className="flex items-center gap-2 text-emerald-400 font-bold">
                      <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                      Live Application Active
                    </span>
                    <a
                      href={dialogue.liveUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-gold-400 hover:underline flex items-center gap-1 font-semibold"
                    >
                      Open Full Tab <FaExternalLinkAlt size={9} />
                    </a>
                  </div>
                  <iframe
                    src={dialogue.liveUrl}
                    title={dialogue.headline || "Live Project"}
                    className="w-full h-[460px] border-0 bg-white"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
                  />
                </div>
              )}
            </div>
          )}

          {/* Skill Groups (Spire of Elements) */}
          {dialogue.skillsGrouped && (
            <div className="space-y-4 pt-2">
              {dialogue.skillsGrouped.map((grp) => (
                <div key={grp.group} className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
                  <h5 className="text-xs font-bold text-gold-400 uppercase tracking-wider mb-2.5">
                    {grp.group}
                  </h5>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {grp.items.map((sk) => (
                      <div key={sk.name} className="flex items-center justify-between rounded-lg bg-slate-950/80 px-3 py-1.5 text-xs">
                        <span className="font-semibold text-slate-200">{sk.name}</span>
                        <span className="text-gold-400 font-bold">{sk.level}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Education & Certifications (Grand Archive) */}
          {dialogue.education && (
            <div className="space-y-4 pt-2">
              <div>
                <h5 className="text-xs font-bold text-gold-400 uppercase tracking-wider mb-2">
                  Academic Milestones
                </h5>
                <div className="space-y-2">
                  {dialogue.education.map((edu, i) => (
                    <div key={i} className="rounded-xl border border-slate-800 bg-slate-900/70 p-3 text-xs">
                      <div className="flex justify-between items-baseline">
                        <h6 className="font-bold text-slate-100">{edu.degree}</h6>
                        <span className="font-semibold text-gold-400 text-[11px]">{edu.year}</span>
                      </div>
                      <p className="text-slate-400 mt-0.5">{edu.school}</p>
                      <p className="text-slate-400 text-[11px] mt-1">{edu.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h5 className="text-xs font-bold text-gold-400 uppercase tracking-wider mb-2">
                  Certifications
                </h5>
                <div className="grid gap-2 sm:grid-cols-2 text-xs">
                  {dialogue.certifications.map((c, i) => (
                    <div key={i} className="rounded-lg border border-slate-800 bg-slate-900/70 p-2.5">
                      <p className="font-bold text-slate-200">{c.name}</p>
                      <p className="text-gold-400 text-[11px]">{c.org}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h5 className="text-xs font-bold text-gold-400 uppercase tracking-wider mb-2">
                  Honors & Athletics
                </h5>
                <ul className="space-y-1.5 text-xs text-slate-300">
                  {dialogue.achievements.map((ach, i) => (
                    <li key={i}>{ach}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Contact Post (Raven Eyrie) */}
          {dialogue.contacts && (
            <div className="space-y-4 pt-2">
              <div className="grid gap-2 sm:grid-cols-2">
                {dialogue.contacts.map((c) => (
                  <a
                    key={c.label}
                    href={c.url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2.5 rounded-xl border border-slate-800 bg-slate-900/80 p-3 text-xs text-slate-200 hover:border-gold-500 hover:text-gold-300 transition"
                  >
                    <span className="text-lg">{c.icon}</span>
                    <span className="font-semibold truncate">{c.label}</span>
                  </a>
                ))}
              </div>

              {dialogue.resumeUrl && (
                <div className="pt-2">
                  <a
                    href={dialogue.resumeUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-600 to-gold-600 py-3 text-xs font-bold text-white shadow-lg transition hover:scale-[1.02]"
                  >
                    <FaFilePdf size={14} />
                    <span>View & Download Official Resume (PDF)</span>
                  </a>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-slate-800 pt-4">
          <p className="text-[11px] text-slate-400">
            Press <kbd className="rounded bg-slate-800 px-1.5 py-0.5 text-gold-400 font-bold">ESC</kbd> or click outside to return to the game world.
          </p>
          <div className="flex gap-2">
            <button
              onClick={onSwitchToClassic}
              className="rounded-xl border border-slate-700 bg-slate-900 px-3.5 py-2 text-xs font-semibold text-slate-300 hover:border-gold-500 hover:text-white"
            >
              Read in Classic View
            </button>
            <button
              onClick={() => {
                sound.playClose();
                onClose();
              }}
              className="rounded-xl bg-brand-600 px-4 py-2 text-xs font-bold text-white hover:bg-brand-500"
            >
              Continue Quest
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default GameDialogModal;
