import React, { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../../components/ui/dialog";
import { format } from 'date-fns';
import { saveAs } from 'file-saver';
import Docxtemplater from 'docxtemplater';
import PizZip from 'pizzip';
import { toast } from 'sonner';
import { renderAsync } from 'docx-preview';

import { generateFieldLetterService } from '../../store/tanstackStore/services/api'; // Import the service
import { queryClient } from '../../utils/tanstack';
import { useMutation } from '@tanstack/react-query';

const GradeProposalGenerateFieldLetter = ({ isOpen, onClose, proposal }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [docxBlob, setDocxBlob] = useState(null);
  const previewRef = useRef(null);

  const resetState = () => {
    setIsGenerating(false);
    setDocxBlob(null);
    if (previewRef.current) {
      previewRef.current.innerHTML = '';
    }
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  const generateLetter = async () => {
    try {
      setIsGenerating(true);
      const loadingToast = toast.loading('Generating letter...');

      // Fetch the template
      const response = await fetch('/template.docx');
      if (!response.ok) {
        throw new Error('Failed to fetch template');
      }
      const templateContent = await response.arrayBuffer();

      // Create a new instance of PizZip
      const zip = new PizZip(templateContent);

      // Create a new instance of Docxtemplater with specific configuration
      const doc = new Docxtemplater(zip, {
        paragraphLoop: true,
        linebreaks: true,
        delimiters: {
          start: '${',
          end: '}'
        }
      });

      // Set the template variables
      doc.setData({
        currentDate: format(new Date(), 'MMMM dd, yyyy'),
        studentName: `${proposal?.student?.firstName?.charAt(0).toUpperCase()}${proposal?.student?.firstName?.slice(1)} ${proposal?.student?.lastName?.charAt(0).toUpperCase()}${proposal?.student?.lastName?.slice(1)}` || '[Student Name]',
        proposalTitle: `${proposal?.title}` || '[Proposal Title]',
        supervisorName: `${proposal?.supervisor?.name}` || '[Supervisor Name]',
        department: `${proposal?.supervisor?.department}` || '[Department Name]',
        university: `Uganda Management Institute` || '[University Name]'
      });

      // Render the document
      doc.render();

      // Generate the document
      const blob = doc.getZip().generate({
        type: 'blob',
        mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      });

      setDocxBlob(blob);

      // Preview the document
      if (previewRef.current) {
        previewRef.current.innerHTML = '';
        await renderAsync(blob, previewRef.current, previewRef.current, {
          className: 'docx-preview',
          inWrapper: false,
          defaultZoom: 0.8,
          renderHeaders: false,
          renderFooters: false,
          useBase64URL: true,
          breakPages: true,
          pageWidth: '100%',
          pageHeight: 'auto',
          pageFit: 'width'
        });
      }

      toast.success('Letter generated successfully!', {
        id: loadingToast,
      });
    } catch (error) {
      console.error('Error generating letter:', error);
      toast.error('Failed to generate letter: ' + error.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (docxBlob) {
      saveAs(docxBlob, `field-letter-${proposal?.student?.firstName}-${proposal?.student?.lastName || 'student'}.docx`);
      handleClose();
    }
  };

  const mutation = useMutation({
    mutationFn: (formData) => generateFieldLetterService(proposal?.id, formData),
    onSuccess: () => {
      toast.success('Document sent successfully!');
      queryClient.resetQueries({ queryKey: ['proposals', proposal?.id] });
      handleClose();
    },
    onError: (error) => {
      console.error('Error sending document:', error);
      toast.error('Failed to send document: ' + error.message);
    }
  });

  const handleSendToServer = async () => {
    if (!docxBlob) return;

    try {
      const formData = new FormData();
      formData.append('docxFile', new File([docxBlob], `field-letter-${proposal?.student?.firstName}-${proposal?.student?.lastName || 'student'}.docx`));
      formData.append('proposalId', proposal?.id);

      mutation.mutate(formData); // Use the mutation function
    } catch (error) {
      console.error('Error preparing document for upload:', error);
      toast.error('Failed to prepare document for upload: ' + error.message);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[1000px] h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold leading-6">
            Generate Field Letter
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 py-4 grid grid-cols-3 gap-4 overflow-hidden">
          <div className="overflow-y-auto">
            <p className="text-sm text-gray-600">
              This will generate a field letter for {`${proposal?.student?.firstName} ${proposal?.student?.lastName}` || 'the student'}.
            </p>
            <div className="mt-4 space-y-2">
              <div className="text-sm">
                <span className="font-medium">Student: </span>
                <span className="text-gray-600">
                  {`${proposal?.student?.firstName} ${proposal?.student?.lastName}` || 'N/A'}
                </span>
              </div>
              <div className="text-sm">
                <span className="font-medium">Proposal Title: </span>
                <span className="text-gray-600">{proposal?.title || 'N/A'}</span>
              </div>
              <div className="text-sm">
                <span className="font-medium">Supervisor: </span>
                <span className="text-gray-600">{proposal?.supervisor?.name || 'N/A'}</span>
              </div>
            </div>
          </div>

          <div className="border rounded-lg p-4 col-span-2 bg-white h-full overflow-hidden">
            <div 
              ref={previewRef}
              className="w-full h-full overflow-auto"
              style={{
                backgroundColor: '#fff',
                boxShadow: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
                display: 'flex',
                justifyContent: 'center'
              }}
            />
          </div>
        </div>

        <DialogFooter>
          <button
            type="button"
            onClick={handleClose}
            className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
          >
            Cancel
          </button>
          {!docxBlob ? (
            <button
              onClick={generateLetter}
              disabled={isGenerating}
              className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
            >
              {isGenerating ? 'Generating...' : 'Generate Preview'}
            </button>
          ) : (
            <div className="space-x-2">
              <button
                onClick={handleDownload}
                disabled={mutation.isPending}
                className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
              >
                Download Document
              </button>
              <button
                onClick={handleSendToServer}
                disabled={mutation.isPending}
                className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
              >
                {mutation.isPending ? 'Sending...' : 'Send to Server'}
              </button>
            </div>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default GradeProposalGenerateFieldLetter;