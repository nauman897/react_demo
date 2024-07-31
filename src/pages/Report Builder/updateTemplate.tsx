import React, { useState, useEffect } from 'react';
import { Container, Form, Button, Row, Col, Accordion } from 'react-bootstrap';
import { listTemplatePrompt, updateCurrentTemplatePrompt } from '../../api/templates';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { FaGripVertical, FaArrowLeft } from 'react-icons/fa';
import { useLocation, useNavigate } from 'react-router-dom';
import {Prompt,UpdateTemplateProps} from '../../components/Interfaces'
import './index.css';


const UpdateTemplate: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { template } = location.state as UpdateTemplateProps;

  const [tempPrompts, setTempPrompts] = useState<Prompt[]>([]);
  const [templateName, setTemplateName] = useState<string>(template.title);
  const [tempEditValue, setTempEditValue] = useState<{ [key: string]: string }>({});
  const [customPromptName, setCustomPromptName] = useState<string>('');
  const [customPromptValue, setCustomPromptValue] = useState<string>('');
  const [customPromptType, setCustomPromptType] = useState<string>('ReportText');

  useEffect(() => {
    const getTemplatePrompts = async (templateKey: string) => {
      try {
        const response = await listTemplatePrompt(templateKey);
        const data = response.data.prompts;
        console.log(data);
        const fetchedPrompts: Prompt[] = data.map((item: any) => ({
          key: item.title,
          value: item.prompt,
          type: item.type,
        }));
        
        setTempPrompts(fetchedPrompts);
        setTempEditValue(fetchedPrompts.reduce<{ [key: string]: string }>((acc, prompt) => {
          acc[prompt.key] = prompt.value;
          return acc;
        }, {}));
      } catch (error: any) {
        console.error('Error fetching prompts from API', error);
      }
    };

    getTemplatePrompts(template.id);
  }, [template.id]);

  const addCustomPrompt = () => {
    if (customPromptName && customPromptValue) {
      const newPrompt = { key: customPromptName, value: customPromptValue, type: customPromptType };
      setTempPrompts([...tempPrompts, newPrompt]);
      setTempEditValue({ ...tempEditValue, [customPromptName]: customPromptValue });
      setCustomPromptName('');
      setCustomPromptValue('');
    }
  };

  const handleSave = (index: number) => {
    const updatedPrompts = tempPrompts.map((prompt, i) =>
      i === index ? { ...prompt, value: tempEditValue[prompt.key] } : prompt
    );
    setTempPrompts(updatedPrompts);
    toast.success(`${updatedPrompts[index].key} updated successfully`);
  };

  const handleRemove = (index: number) => {
    const updatedPrompts = tempPrompts.filter((_, i) => i !== index);
    const updatedEditValue = { ...tempEditValue };
    delete updatedEditValue[tempPrompts[index].key];
    setTempPrompts(updatedPrompts);
    setTempEditValue(updatedEditValue);
  };

  const handleEditChange = (index: number, value: string) => {
    const key = tempPrompts[index].key;
    setTempEditValue({ ...tempEditValue, [key]: value });
  };

  const handleOnDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const items = Array.from(tempPrompts);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    setTempPrompts(items);

    const newEditValue = items.reduce((acc, prompt) => {
      acc[prompt.key] = tempEditValue[prompt.key];
      return acc;
    }, {} as { [key: string]: string });

    setTempEditValue(newEditValue);
  };

  const handleUpdateTemplate = async () => {
    const promptsArray = tempPrompts.map((prompt) => ({
      prompt: prompt.value,
      title: prompt.key,
      type: prompt.type,
    }));

    const templateData = {
      prompts: promptsArray,
      title: templateName,
    };

    try {
      console.log("prompts dictionary", templateData);
      console.log("prompts id", template.id);
      await updateCurrentTemplatePrompt(template.id, templateData);
      toast.success("Template updated successfully!");
    } catch (error: any) {
      console.error("Error updating template", error);
      toast.error("Error updating template");
    }
  };

  return (
    <Container>
      <ToastContainer />
      <FaArrowLeft className="me-2 back" onClick={() => navigate('/view-template')} style={{ cursor: 'pointer' }} /> 
      
      <h1>Update Report Template</h1>
      
      <Button variant="success" className="btn mb-4" onClick={handleUpdateTemplate}>
            Update
      </Button>
      
      <Row className="d-flex align-items-end">
        <Col>
          <Form>
            <Form.Group controlId="templateName">
              <Form.Label>Title</Form.Label>
              <Form.Control
                type="text"
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                placeholder="Enter template name"
              />
            </Form.Group>
          </Form>
        </Col>
      </Row>
      <DragDropContext onDragEnd={handleOnDragEnd}>
        <Droppable droppableId="prompts">
          {(providedDroppable) => (
            <div {...providedDroppable.droppableProps} ref={providedDroppable.innerRef} className='mt-5'>
              <Accordion alwaysOpen>
                {tempPrompts.map((prompt, index) => (
                  <Draggable key={prompt.key} draggableId={prompt.key} index={index}>
                    {(providedDraggable) => (
                      <Accordion.Item
                        eventKey={prompt.key}
                        key={prompt.key}
                        ref={providedDraggable.innerRef}
                        {...providedDraggable.draggableProps}
                        {...providedDraggable.dragHandleProps}
                      >
                        <Container>
                          <Row className='prompt'>
                            <div className='drag-btn'>
                              <FaGripVertical />
                            </div>
                            <Col>
                              <Accordion.Header>{prompt.key}   <small><i>&nbsp;&nbsp;({prompt.type})</i></small></Accordion.Header>
                              <Accordion.Body>
                                <Row>
                                  <Form.Control
                                    className='existing-prompts-form-control'
                                    as="textarea"
                                    rows={4}
                                    value={tempEditValue[prompt.key]}
                                    onChange={(e) => handleEditChange(index, e.target.value)}
                                  />
                                </Row>
                                <Row>
                                  <Col xs={12} md="auto" className="mb-2 mb-md-0">
                                    <Button variant="primary" onClick={() => handleSave(index)}>Save</Button>
                                  </Col>
                                  <Col xs={12} md="auto" className="mb-2 mb-md-0">
                                    <Button variant="outline-danger" className="ml-lg-2 mt-2 mt-lg-0" onClick={() => handleRemove(index)}>Remove</Button>
                                  </Col>
                                </Row>
                              </Accordion.Body>
                            </Col>
                          </Row>
                        </Container>
                      </Accordion.Item>
                    )}
                  </Draggable>
                ))}
                {providedDroppable.placeholder}
              </Accordion>
            </div>
          )}
        </Droppable>
      </DragDropContext>
      
      <Form>
        <h2 className="mt-4">Add New Section</h2>
        <Form.Group controlId="customPromptName">
          <Form.Label>Enter section title</Form.Label>
          <Form.Control
            type="text"
            value={customPromptName}
            onChange={(e) => setCustomPromptName(e.target.value)}
            placeholder="Enter custom section title"
          />
        </Form.Group>

        <Form.Group controlId="customPromptType" className='mt-2'>
          <Form.Label>Select section type</Form.Label>
          <Form.Select
            value={customPromptType}
            onChange={(e) => setCustomPromptType(e.target.value)}
          >
            <option value="ReportText">Report Text</option>
          </Form.Select>
        </Form.Group>

        <Form.Group controlId="customPromptValue">
          <Form.Label>Enter prompt</Form.Label>
          <Form.Control
            as="textarea"
            rows={3}
            value={customPromptValue}
            onChange={(e) => setCustomPromptValue(e.target.value)}
            placeholder="Enter custom prompt"
          />
        </Form.Group>
        <Row className="justify-content-left mt-4">
          <Col xs={12} md="auto" className="mb-2 mb-md-0">
            <Button variant="primary" className="w-100" onClick={addCustomPrompt}>
              Add Section
            </Button>
          </Col>
        </Row>
      </Form>
    </Container>
  );
};

export default UpdateTemplate;
