import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { FileText, Download, ExternalLink, Image, Play, FileArchive, Eye } from 'lucide-react';
import ImageViewer from './ImageViewer';
import PDFViewer from './PDFViewer';
import VideoViewer from './VideoViewer';

const ContributionFiles = ({ files = [], links = {} }) => {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [pdfOpen, setPdfOpen] = useState(false);
  const [videoOpen, setVideoOpen] = useState(false);
  const [pdfTitle, setPdfTitle] = useState('');
  const [pdfUrl, setPdfUrl] = useState('');
  const [lightboxImages, setLightboxImages] = useState([]);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [videoTitle, setVideoTitle] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [videoPoster, setVideoPoster] = useState('');

  const imageFiles = useMemo(() => files.filter(f => f?.type?.startsWith?.('image/')), [files]);
  const pdfFiles = useMemo(() => files.filter(f => f?.type?.includes?.('pdf') || f?.originalName?.toLowerCase?.()?.endsWith?.('.pdf')), [files]);
  const videoFiles = useMemo(() => files.filter(f => f?.type?.startsWith?.('video/')), [files]);
  const otherFiles = useMemo(() => files.filter(f => !f?.type?.startsWith?.('image/') && !f?.type?.includes?.('pdf') && !f?.type?.startsWith?.('video/')), [files]);

  const openLightbox = (file) => {
    const allImages = imageFiles.length ? imageFiles : [file];
    const idx = allImages.findIndex(f => f.publicUrl === file.publicUrl);
    setLightboxImages(allImages);
    setLightboxIndex(idx >= 0 ? idx : 0);
    setLightboxOpen(true);
  };

  const openPdf = (file) => {
    setPdfUrl(file.publicUrl || file.url || '');
    setPdfTitle(file.originalName || 'PDF Preview');
    setPdfOpen(true);
  };

  const openVideo = (file) => {
    setVideoUrl(file.publicUrl || file.url || '');
    setVideoTitle(file.originalName || 'Video Preview');
    setVideoPoster(file.thumbnailUrl || file.previewUrl || '');
    setVideoOpen(true);
  };

  const formatFileSize = (bytes) => {
    if (!bytes || bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  };

  const getFileIcon = (type) => {
    if (type?.startsWith('image/')) return <Image size={20} style={{ color: 'var(--color-secondary)' }} />;
    if (type?.startsWith('video/')) return <Play size={20} style={{ color: 'var(--color-purple)' }} />;
    if (type?.includes('pdf') || type === 'application/pdf') return <FileText size={20} style={{ color: 'var(--color-error)' }} />;
    return <FileArchive size={20} style={{ color: 'var(--color-primary)' }} />;
  };

  return (
    <>
      <div className="card" style={{ padding: '1.5rem' }}>
        <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-lg)', fontWeight: 700, color: 'var(--color-heading)', marginBottom: '1rem' }}>
          Files & Links
        </h4>
        {files.length === 0 && !Object.values(links).some(Boolean) && (
          <p style={{ color: 'var(--color-body)', fontSize: 'var(--text-base)' }}>No files or links attached.</p>
        )}
        {files.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1rem' }}>
            {files.map((file, index) => {
              const isImage = file?.type?.startsWith?.('image/');
              const isPdf = file?.type?.includes?.('pdf') || file?.originalName?.toLowerCase?.()?.endsWith?.('.pdf');
              const isVideo = file?.type?.startsWith?.('video/');

              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    padding: '0.75rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--color-border)',
                    background: 'var(--color-card)',
                  }}
                >
                  <div style={{ padding: '0.5rem', borderRadius: 'var(--radius-sm)', background: 'var(--color-bg)' }}>
                    {getFileIcon(file.type || file.mimeType)}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 'var(--text-base)', fontWeight: 600, color: 'var(--color-heading)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{file.originalName || file.name}</div>
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-body)' }}>{formatFileSize(file.size)}</div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {isImage && (
                      <button
                        type="button"
                        onClick={() => openLightbox(file)}
                        className="btn btn-secondary"
                        style={{ padding: '0.35rem 0.6rem', fontSize: 'var(--text-sm)', display: 'inline-flex', alignItems: 'center', gap: '0.25rem', color: 'var(--color-secondary)', borderColor: 'var(--color-secondary)' }}
                      >
                        <Eye size={14} /> Preview
                      </button>
                    )}
                    {isPdf && (
                      <button
                        type="button"
                        onClick={() => openPdf(file)}
                        className="btn btn-secondary"
                        style={{ padding: '0.35rem 0.6rem', fontSize: 'var(--text-sm)', display: 'inline-flex', alignItems: 'center', gap: '0.25rem', color: 'var(--color-error)', borderColor: 'var(--color-error)' }}
                      >
                        <Eye size={14} /> Preview
                      </button>
                    )}
                    {isVideo && (
                      <button
                        type="button"
                        onClick={() => openVideo(file)}
                        className="btn btn-secondary"
                        style={{ padding: '0.35rem 0.6rem', fontSize: 'var(--text-sm)', display: 'inline-flex', alignItems: 'center', gap: '0.25rem', color: 'var(--color-purple)', borderColor: 'var(--color-purple)' }}
                      >
                        <Play size={14} /> Play
                      </button>
                    )}
                    <a
                      href={file.publicUrl || file.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ padding: '0.35rem 0.6rem', borderRadius: 'var(--radius-sm)', background: 'var(--color-bg)', border: '1px solid var(--color-border)', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontSize: 'var(--text-sm)', color: 'var(--color-primary)', textDecoration: 'none' }}
                    >
                      <Download size={14} /> Download
                    </a>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
        {(links.githubUrl || links.figmaUrl || links.canvaUrl || links.googleDriveUrl) && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {links.githubUrl && (
              <a href={links.githubUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize: 'var(--text-base)', color: 'var(--color-primary)', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                <ExternalLink size={14} /> GitHub Repository
              </a>
            )}
            {links.figmaUrl && (
              <a href={links.figmaUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize: 'var(--text-base)', color: 'var(--color-primary)', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                <ExternalLink size={14} /> Figma Design
              </a>
            )}
            {links.canvaUrl && (
              <a href={links.canvaUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize: 'var(--text-base)', color: 'var(--color-primary)', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                <ExternalLink size={14} /> Canva Design
              </a>
            )}
            {links.googleDriveUrl && (
              <a href={links.googleDriveUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize: 'var(--text-base)', color: 'var(--color-primary)', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                <ExternalLink size={14} /> Google Drive
              </a>
            )}
          </div>
        )}
      </div>

      <ImageViewer
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        images={lightboxImages}
        currentIndex={lightboxIndex}
        onNext={(idx) => setLightboxIndex(idx)}
        onPrev={(idx) => setLightboxIndex(idx)}
      />
      <PDFViewer
        isOpen={pdfOpen}
        onClose={() => setPdfOpen(false)}
        pdfUrl={pdfUrl}
        title={pdfTitle}
      />
      <VideoViewer
        isOpen={videoOpen}
        onClose={() => setVideoOpen(false)}
        videoUrl={videoUrl}
        poster={videoPoster}
        title={videoTitle}
      />
    </>
  );
};

export default ContributionFiles;
