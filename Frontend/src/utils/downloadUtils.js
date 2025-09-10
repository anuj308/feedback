import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import Papa from 'papaparse';
import { saveAs } from 'file-saver';

// Enhanced PDF Download with proper analytics data structure
export const downloadCompletePDF = async (data, formTitle) => {
  try {
    const pdf = new jsPDF();
    let yPosition = 20;
    
    // Title
    pdf.setFontSize(20);
    pdf.setFont(undefined, 'bold');
    pdf.text(`Complete Analytics Report: ${formTitle}`, 20, yPosition);
    yPosition += 20;
    
    // Summary Section
    pdf.setFontSize(16);
    pdf.setFont(undefined, 'bold');
    pdf.text('Response Summary', 20, yPosition);
    yPosition += 15;
    
    pdf.setFontSize(12);
    pdf.setFont(undefined, 'normal');
    const totalResponses = data.totalResponses || data.individualResponses?.length || 0;
    pdf.text(`${totalResponses} responses collected`, 20, yPosition);
    yPosition += 15;
    
    // Create summary data table
    const summaryData = [
      ['Total Responses', totalResponses.toString()],
      ['Completion Rate', `${data.completionRate || 100}%`]
    ];
    
    if (data.averageRating && data.averageRating !== 'N/A') {
      summaryData.push(['Average Rating', data.averageRating.toString()]);
    }
    
    autoTable(pdf, {
      body: summaryData,
      startY: yPosition,
      theme: 'grid',
      margin: { left: 20 },
      styles: { fontSize: 10 },
      columnStyles: {
        0: { cellWidth: 60, fontStyle: 'bold' },
        1: { cellWidth: 80 }
      }
    });
    
    yPosition = pdf.lastAutoTable.finalY + 20;
    
    // Who has responded section - Show ALL responses
    if (data.individualResponses && data.individualResponses.length > 0) {
      if (yPosition > 220) {
        pdf.addPage();
        yPosition = 20;
      }
      
      pdf.setFontSize(14);
      pdf.setFont(undefined, 'bold');
      pdf.text('Who has responded?', 20, yPosition);
      yPosition += 15;
      
      // Extract respondent information from ALL responses
      const respondents = [];
      
      data.individualResponses.forEach((response, index) => {
        let respondentInfo = 'Anonymous';
        
        // Try to get name from response data
        if (response.respondentUser) {
          respondentInfo = response.respondentUser.fullName || response.respondentUser.email || 'Anonymous';
        } else if (response.answers && Array.isArray(response.answers)) {
          // Look for name or email in answers
          for (const answerObj of response.answers) {
            if (answerObj.answer && answerObj.answer.trim()) {
              const answer = answerObj.answer.trim();
              // Check if this looks like a name or email
              if (answer.includes('@') || (/^[a-zA-Z\s]+$/.test(answer) && answer.length > 2)) {
                respondentInfo = answer;
                break;
              }
            }
          }
        }
        
        respondents.push([
          `Response #${index + 1}`,
          respondentInfo,
          new Date(response.createdAt).toLocaleDateString(),
          new Date(response.createdAt).toLocaleTimeString()
        ]);
      });
      
      // Show ALL respondents in batches if too many
      const maxPerPage = 20;
      let currentBatch = 0;
      
      while (currentBatch * maxPerPage < respondents.length) {
        if (currentBatch > 0) {
          pdf.addPage();
          yPosition = 20;
          pdf.setFontSize(14);
          pdf.setFont(undefined, 'bold');
          pdf.text(`Who has responded? (Page ${currentBatch + 1})`, 20, yPosition);
          yPosition += 15;
        }
        
        const batchStart = currentBatch * maxPerPage;
        const batchEnd = Math.min((currentBatch + 1) * maxPerPage, respondents.length);
        const currentRespondents = respondents.slice(batchStart, batchEnd);
        
        autoTable(pdf, {
          head: [['Response #', 'Respondent', 'Date', 'Time']],
          body: currentRespondents,
          startY: yPosition,
          theme: 'striped',
          margin: { left: 20 },
          styles: { fontSize: 9 },
          columnStyles: {
            0: { cellWidth: 25 },
            1: { cellWidth: 60 },
            2: { cellWidth: 30 },
            3: { cellWidth: 25 }
          }
        });
        
        yPosition = pdf.lastAutoTable.finalY + 20;
        currentBatch++;
      }
    }
    
    // Question Analysis Section using questionStats from analytics API
    if (data.questionStats && data.questionStats.length > 0) {
      pdf.addPage();
      yPosition = 20;
      
      pdf.setFontSize(16);
      pdf.setFont(undefined, 'bold');
      pdf.text('Question Analysis', 20, yPosition);
      yPosition += 20;
      
      data.questionStats.forEach((questionStat, index) => {
        if (yPosition > 220) {
          pdf.addPage();
          yPosition = 20;
        }
        
        // Question header
        pdf.setFontSize(12);
        pdf.setFont(undefined, 'bold');
        const questionTitle = questionStat.question || `Question ${index + 1}`;
        pdf.text(`Q${index + 1}: ${questionTitle}`, 20, yPosition);
        yPosition += 10;
        
        // Question metadata
        pdf.setFontSize(10);
        pdf.setFont(undefined, 'normal');
        pdf.text(`${questionStat.totalResponses || 0} responses`, 20, yPosition);
        yPosition += 8;
        
        // Handle different question types based on analytics data
        if (questionStat.type === 'shortAnswer' || questionStat.type === 'paragraph') {
          // Text questions - show ALL unique responses
          const uniqueAnswers = [...new Set(questionStat.responses || [])].filter(r => r && r.trim());
          pdf.text(`${uniqueAnswers.length} unique responses`, 20, yPosition);
          yPosition += 10;
          
          if (uniqueAnswers.length > 0) {
            // Show ALL responses, not just a sample
            const allResponses = uniqueAnswers.map(answer => [`"${answer}"`]);
            
            autoTable(pdf, {
              head: [['All Unique Responses']],
              body: allResponses,
              startY: yPosition,
              theme: 'grid',
              margin: { left: 20 },
              styles: { fontSize: 9 },
              columnStyles: {
                0: { cellWidth: 120 }
              }
            });
            yPosition = pdf.lastAutoTable.finalY + 10;
          }
        } else if (questionStat.answerDistribution || questionStat.optionDistribution) {
          // Multiple choice, dropdown, checkbox - show distribution
          const distribution = questionStat.answerDistribution || questionStat.optionDistribution;
          const responseData = Object.entries(distribution).map(([option, count]) => {
            const percentage = ((count / questionStat.totalResponses) * 100).toFixed(1);
            return [option, count.toString(), `${percentage}%`];
          });
          
          autoTable(pdf, {
            head: [['Response Option', 'Count', 'Percentage']],
            body: responseData,
            startY: yPosition,
            theme: 'striped',
            margin: { left: 20 },
            styles: { fontSize: 9 },
            columnStyles: {
              0: { cellWidth: 80 },
              1: { cellWidth: 20 },
              2: { cellWidth: 25 }
            }
          });
          
          yPosition = pdf.lastAutoTable.finalY + 15;
        } else {
          pdf.text('No response analysis available', 20, yPosition);
          yPosition += 15;
        }
        
        // Add spacing between questions
        yPosition += 5;
      });
    }
    
    // Individual Responses Section - Show ALL responses
    if (data.individualResponses && data.individualResponses.length > 0) {
      pdf.addPage();
      yPosition = 20;
      
      pdf.setFontSize(16);
      pdf.setFont(undefined, 'bold');
      pdf.text('Individual Responses', 20, yPosition);
      yPosition += 15;
      
      data.individualResponses.forEach((response, index) => {
        if (yPosition > 230) {
          pdf.addPage();
          yPosition = 20;
        }
        
        pdf.setFontSize(12);
        pdf.setFont(undefined, 'bold');
        pdf.text(`Response #${index + 1}`, 20, yPosition);
        yPosition += 8;
        
        pdf.setFontSize(10);
        pdf.setFont(undefined, 'normal');
        const responseDate = new Date(response.createdAt);
        pdf.text(`Date: ${responseDate.toLocaleDateString()}`, 20, yPosition);
        pdf.text(`Time: ${responseDate.toLocaleTimeString()}`, 120, yPosition);
        yPosition += 12;
        
        // Response details table
        const responseData = [];
        
        if (response.answers && Array.isArray(response.answers)) {
          response.answers.forEach((answerObj, qIndex) => {
            let questionText = `Question ${qIndex + 1}`;
            
            // Try to get question text from form questions
            if (data.formQuestions && data.formQuestions[qIndex]) {
              questionText = data.formQuestions[qIndex].question || data.formQuestions[qIndex].questionText || questionText;
            }
            
            let answerText = answerObj.answer || 'No Answer';
            
            // Handle JSON array answers (for checkboxes)
            if (typeof answerText === 'string' && answerText.startsWith('[') && answerText.endsWith(']')) {
              try {
                const parsed = JSON.parse(answerText);
                if (Array.isArray(parsed)) {
                  answerText = parsed.join(', ');
                }
              } catch (e) {
                // Keep original string if parsing fails
              }
            }
            
            responseData.push([`Q${qIndex + 1}: ${questionText}`, answerText]);
          });
        }
        
        if (responseData.length > 0) {
          autoTable(pdf, {
            head: [['Question', 'Answer']],
            body: responseData,
            startY: yPosition,
            theme: 'grid',
            margin: { left: 20 },
            styles: { fontSize: 8 },
            columnStyles: {
              0: { cellWidth: 70 },
              1: { cellWidth: 90 }
            }
          });
          
          yPosition = pdf.lastAutoTable.finalY + 15;
        } else {
          pdf.text('No response data available', 20, yPosition);
          yPosition += 15;
        }
      });
    }
    
    pdf.save(`${formTitle}-complete-report.pdf`);
  } catch (error) {
    console.error('Error generating PDF:', error);
    alert('Error generating PDF. Please try again.');
  }
};

// Enhanced CSV Download with proper analytics data structure
export const downloadCompleteCSV = (data, formTitle) => {
  try {
    const workbook = [];
    const totalResponses = data.totalResponses || data.individualResponses?.length || 0;
    
    // Summary Sheet Data
    workbook.push(['FORM ANALYTICS SUMMARY']);
    workbook.push(['']);
    workbook.push(['Form Title', formTitle]);
    workbook.push(['Report Generated', new Date().toLocaleString()]);
    workbook.push(['']);
    workbook.push(['OVERVIEW METRICS']);
    workbook.push(['Metric', 'Value']);
    workbook.push(['Total Responses', totalResponses]);
    workbook.push(['Completion Rate', `${data.completionRate || 100}%`]);
    
    if (data.averageRating && data.averageRating !== 'N/A') {
      workbook.push(['Average Rating', data.averageRating]);
    }
    
    workbook.push(['']);
    workbook.push(['WHO HAS RESPONDED']);
    workbook.push(['Response_ID', 'Respondent', 'Date', 'Time', 'Full_DateTime']);
    
    // Add ALL respondent information
    if (data.individualResponses && data.individualResponses.length > 0) {
      data.individualResponses.forEach((response, index) => {
        const responseDate = new Date(response.createdAt);
        let respondentInfo = 'Anonymous';
        
        // Try to get name from response data
        if (response.respondentUser) {
          respondentInfo = response.respondentUser.fullName || response.respondentUser.email || 'Anonymous';
        } else if (response.answers && Array.isArray(response.answers)) {
          // Look for name or email in answers
          for (const answerObj of response.answers) {
            if (answerObj.answer && answerObj.answer.trim()) {
              const answer = answerObj.answer.trim();
              // Check if this looks like a name or email
              if (answer.includes('@') || (/^[a-zA-Z\s]+$/.test(answer) && answer.length > 2)) {
                respondentInfo = answer;
                break;
              }
            }
          }
        }
        
        workbook.push([
          `Response_${index + 1}`,
          respondentInfo,
          responseDate.toLocaleDateString(),
          responseDate.toLocaleTimeString(),
          responseDate.toLocaleString()
        ]);
      });
    }
    
    workbook.push(['']);
    workbook.push(['='.repeat(80)]);
    workbook.push(['']);
    
    // Question Analysis Sheet Data using questionStats
    if (data.questionStats && data.questionStats.length > 0) {
      workbook.push(['QUESTION ANALYSIS']);
      workbook.push(['']);
      workbook.push(['Question_Number', 'Question_Text', 'Question_Type', 'Total_Responses', 'Unique_Responses', 'Analysis_Type', 'Response_Option', 'Count', 'Percentage']);
      
      data.questionStats.forEach((questionStat, qIndex) => {
        const questionNumber = `Q${qIndex + 1}`;
        const questionText = questionStat.question || `Question ${qIndex + 1}`;
        const questionType = questionStat.type || 'text';
        const totalQuestionResponses = questionStat.totalResponses || 0;
        
        if (questionStat.type === 'shortAnswer' || questionStat.type === 'paragraph') {
          // Text questions - show unique responses
          const uniqueAnswers = [...new Set(questionStat.responses || [])].filter(r => r && r.trim());
          
          workbook.push([
            questionNumber,
            questionText,
            questionType,
            totalQuestionResponses,
            uniqueAnswers.length,
            'Unique Text Responses',
            'All responses below',
            '',
            ''
          ]);
          
          // Add ALL unique responses
          uniqueAnswers.forEach((answer, rIndex) => {
            workbook.push([
              '',
              '',
              '',
              '',
              '',
              '',
              `"${answer}"`,
              '1',
              `${(1/totalQuestionResponses * 100).toFixed(1)}%`
            ]);
          });
        } else if (questionStat.answerDistribution || questionStat.optionDistribution) {
          // Multiple choice, dropdown, checkbox - show distribution
          const distribution = questionStat.answerDistribution || questionStat.optionDistribution;
          const uniqueOptions = Object.keys(distribution).length;
          
          workbook.push([
            questionNumber,
            questionText,
            questionType,
            totalQuestionResponses,
            uniqueOptions,
            'Response Distribution',
            '',
            '',
            ''
          ]);
          
          Object.entries(distribution).forEach(([option, count]) => {
            const percentage = ((count / totalQuestionResponses) * 100).toFixed(1);
            workbook.push([
              '',
              '',
              '',
              '',
              '',
              '',
              option,
              count,
              `${percentage}%`
            ]);
          });
        } else {
          workbook.push([
            questionNumber,
            questionText,
            questionType,
            totalQuestionResponses,
            0,
            'No Analysis Available',
            'No response data',
            0,
            '0%'
          ]);
        }
        
        workbook.push(['']); // Empty row between questions
      });
    }
    
    workbook.push(['']);
    workbook.push(['='.repeat(80)]);
    workbook.push(['']);
    
    // Individual Responses Sheet Data - Show ALL responses
    if (data.individualResponses && data.individualResponses.length > 0) {
      workbook.push(['INDIVIDUAL RESPONSES']);
      workbook.push(['']);
      
      // Create headers with shorter names to avoid column width issues
      const headers = [
        'Response_ID',
        'Date',
        'Time',
        'DateTime_Full',
        'Respondent'
      ];
      
      // Add question headers
      if (data.individualResponses[0].answers) {
        data.individualResponses[0].answers.forEach((answerObj, index) => {
          let questionText = `Q${index + 1}`;
          
          // Try to get question text from form questions
          if (data.formQuestions && data.formQuestions[index]) {
            questionText = data.formQuestions[index].question || data.formQuestions[index].questionText || questionText;
          }
          
          headers.push(`Q${index + 1}_Question`);
          headers.push(`Q${index + 1}_Answer`);
        });
      }
      
      workbook.push(headers);
      
      // Add ALL response data
      data.individualResponses.forEach((response, index) => {
        const responseDate = new Date(response.createdAt);
        let respondentInfo = 'Anonymous';
        
        // Try to get name from response data
        if (response.respondentUser) {
          respondentInfo = response.respondentUser.fullName || response.respondentUser.email || 'Anonymous';
        } else if (response.answers && Array.isArray(response.answers)) {
          // Look for name or email in answers
          for (const answerObj of response.answers) {
            if (answerObj.answer && answerObj.answer.trim()) {
              const answer = answerObj.answer.trim();
              // Check if this looks like a name or email
              if (answer.includes('@') || (/^[a-zA-Z\s]+$/.test(answer) && answer.length > 2)) {
                respondentInfo = answer;
                break;
              }
            }
          }
        }
        
        const row = [
          `Response_${index + 1}`,
          responseDate.toLocaleDateString(),
          responseDate.toLocaleTimeString(),
          responseDate.toLocaleString(),
          respondentInfo
        ];
        
        // Add answer data for each question
        if (response.answers && Array.isArray(response.answers)) {
          response.answers.forEach((answerObj, qIndex) => {
            let questionText = `Question ${qIndex + 1}`;
            
            // Try to get question text from form questions
            if (data.formQuestions && data.formQuestions[qIndex]) {
              questionText = data.formQuestions[qIndex].question || data.formQuestions[qIndex].questionText || questionText;
            }
            
            let answerText = answerObj.answer || 'No Answer';
            
            // Handle JSON array answers (for checkboxes)
            if (typeof answerText === 'string' && answerText.startsWith('[') && answerText.endsWith(']')) {
              try {
                const parsed = JSON.parse(answerText);
                if (Array.isArray(parsed)) {
                  answerText = parsed.join('; ');
                }
              } catch (e) {
                // Keep original string if parsing fails
              }
            }
            
            row.push(questionText);
            row.push(answerText);
          });
        }
        
        workbook.push(row);
      });
    }
    
    // Convert to CSV format with proper escaping and wider columns
    const csvContent = workbook.map(row => 
      row.map(cell => {
        const cellStr = String(cell || '');
        if (cellStr.includes(',') || cellStr.includes('"') || cellStr.includes('\n') || cellStr.includes('\r')) {
          return `"${cellStr.replace(/"/g, '""')}"`;
        }
        return cellStr;
      }).join(',')
    ).join('\n');
    
    // Add BOM for Excel compatibility and proper encoding
    const BOM = '\uFEFF';
    const blob = new Blob([BOM + csvContent], { 
      type: 'text/csv;charset=utf-8;' 
    });
    
    saveAs(blob, `${formTitle}-complete-analytics-${new Date().toISOString().split('T')[0]}.csv`);
    
  } catch (error) {
    console.error('Error generating CSV:', error);
    alert('Error generating CSV. Please try again.');
  }
};

// Keep the existing simple functions for backward compatibility
export const downloadSectionPDF = downloadCompletePDF;
export const downloadSectionCSV = downloadCompleteCSV;
