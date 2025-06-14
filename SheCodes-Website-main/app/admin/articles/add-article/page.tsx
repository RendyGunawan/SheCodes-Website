"use client";

import React, { useState, useRef } from 'react'; 
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trash2, PlusCircle } from 'lucide-react';
import type { ArticleCategory } from "@/types/blog";
import apiService from '@/lib/apiService';
import toast from 'react-hot-toast';

const ArticleFormPage: React.FC = () => {
    const router = useRouter();
    const [articlePhoto, setArticlePhoto] = useState<File | null>(null);
    const [articlePhotoPreview, setArticlePhotoPreview] = useState<string | null>(null);
    const [title, setTitle] = useState('');
    const [category, setCategory] = useState<ArticleCategory>('Tech & Innovation');
    const [excerpt, setExcerpt] = useState('');
    const [authorName, setAuthorName] = useState('');
    const [slug, setSlug] = useState('');
    const [sections, setSections] = useState<string[]>(['']); 
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setArticlePhoto(file);
            setArticlePhotoPreview(URL.createObjectURL(file));
        }
    };

    const handleUploadAreaClick = () => { fileInputRef.current?.click(); };
    const addSection = () => { setSections([...sections, '']); };
    const updateSectionDescription = (index: number, value: string) => {
        setSections(sections.map((s, i) => i === index ? value : s));
    };
    const removeSection = (index: number) => {
        setSections(sections.filter((_, i) => i !== index));
    };

    // --- End Sections Handlers ---

    const handleSaveArticle = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!articlePhoto) {
            toast.error("Please upload a featured image.");
            return;
        }

        setIsSubmitting(true);
        const toastId = toast.loading("Creating article...");

        const formData = new FormData();
        formData.append('title', title);
        formData.append('slug', slug);
        formData.append('category', category);
        formData.append('excerpt', excerpt);
        formData.append('author_name', authorName);
        formData.append('image', articlePhoto);
        sections.forEach((section) => formData.append('sections', section));
        // The backend expects published_at, let's send the current time
        formData.append('published_at', new Date().toISOString());

        try {
            await apiService.post("/blogs/upload", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            toast.success("Article created successfully!", { id: toastId });
            router.push("/admin/articles");
        } catch (err) {
            toast.error("Failed to create article.", { id: toastId });
        } finally {
            setIsSubmitting(false);
        }
    };

    // Basic Input styling matching the image (adjust border color, placeholder color, padding)
    const inputStyles = "text-black border-[#bfbfbf] rounded-lg placeholder:text-[#bfbfbf] py-5 px-3 focus:ring-2 focus:ring-blueSky focus:ring-offset-1";
    const labelStyles = "block text-md font-semibold text-black mb-2";
    const buttonStyles = "bg-white hover:bg-blueSky border-[2px] border-blueSky text-blueSky font-semibold hover:text-white py-2 px-4 rounded-lg text-sm inline-flex items-center gap-1";
    const removeButtonStyles = "bg-red-500 hover:bg-red-600 text-white font-medium py-1 px-2 rounded-md text-xs inline-flex items-center gap-1";

    return (
        <main className="flex-1 px-10 py-6"> {/* Added background color */}
            <div className='bg-white rounded-xl shadow-md space-y-6 p-6 md:p-8'> {/* Adjusted padding and rounded */}
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-semibold text-gray-800">Add a New Article</h1>
                    <Button variant="outline" onClick={() => router.back()} className="text-sm">
                        Back
                    </Button>
                </div>

                <form onSubmit={handleSaveArticle} className="space-y-6"> {/* Adjusted spacing */}

                    {/* Photo Upload Section */}
                    <div>
                        <label className={`${labelStyles}`}>
                            Photo<span className="text-red-500">*</span>
                        </label>
                        <div
                            className="mt-1 flex justify-center items-center flex-col px-6 py-10 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer min-h-[400px] bg-blue-50/60 hover:bg-blue-100 transition-colors" // Style like the image
                            onClick={handleUploadAreaClick}
                            role="button" // Accessibility
                            tabIndex={0} // Accessibility
                            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleUploadAreaClick(); }} // Accessibility
                        >
                            {articlePhotoPreview ? (
                                <Image src={articlePhotoPreview} alt="Event Preview" width={350} height={300} className=" object-contain rounded-md" />
                            ) : (
                                // Placeholder Icon and Text from the image
                                <div className="text-center">
                                     {/* Simple placeholder representation from image */}
                                    <div className="mx-auto h-20 w-20 mb-2 relative flex items-center justify-center">
                                        <div className="relative aspect-[4/3] min-h-[100px] w-full rounded-xl mb-4 overflow-hidden">
                                            <Image
                                                src="/uploadimage.svg"
                                                alt="Upload project image placeholder"
                                                fill
                                                className="object-contain bg-transparent"
                                            />
                                        </div>
                                    </div>
                                    <span className="mt-2 block text-sm font-semibold text-gray-700">Upload Image</span>
                                </div>
                            )}
                            <input
                                ref={fileInputRef}
                                type="file"
                                id="eventPhotoInput" // Added ID
                                name="eventPhotoInput" // Added name
                                accept="image/jpeg, image/png, image/gif" // Accept common image formats
                                onChange={handleFileChange}
                                className="hidden"
                            />
                        </div>
                        <p className="mt-1 text-xs text-gray-500">Supported formats: JPG, PNG, GIF. Max size: 5MB.</p> {/* Added helper text */}
                    </div>

                    {/* Event Title */}
                    <div>
                        <label htmlFor="articleTitle" className={`${labelStyles}`}>
                            Article Title<span className="text-red-500">*</span>
                        </label>
                        <Input
                            type="text"
                            id="articleTitle"
                            name="articleTitle"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Enter title here"
                            className={inputStyles}
                            required
                        />
                    </div>

                    {/* Category */}
                    <div>
                        <label htmlFor="category" className={`${labelStyles}`}>
                            Category<span className="text-red-500">*</span>
                        </label>
                        <Select value={category || ''} onValueChange={(value) => setCategory(value as ArticleCategory)} name="category" required>
                            <SelectTrigger className={`${inputStyles} text-left`}>
                                <SelectValue placeholder="Enter category here" />
                            </SelectTrigger>
                            <SelectContent className='bg-white border-gray-300 rounded-md shadow-lg'>
                                {/* Add actual categories here */}
                                <SelectItem value="Tech & Innovation">Tech & Innovation</SelectItem>
                                <SelectItem value="Career Growth">Career Growth</SelectItem>
                                <SelectItem value="Community">Community</SelectItem>
                                <SelectItem value="Event">Event</SelectItem>
                                <SelectItem value="Success Stories">Success Stories</SelectItem>
                                <SelectItem value="Others">Others</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Excerpt */}
                    <div>
                        <label htmlFor="description" className={`${labelStyles}`}>
                            Excerpt<span className="text-red-500">*</span>
                        </label>
                        <Textarea
                            id="description"
                            name="description"
                            value={excerpt}
                            onChange={(e) => setExcerpt(e.target.value)}
                            placeholder="Enter description here"
                            className={`${inputStyles} min-h-[100px]`} // Adjusted styling
                            rows={4}
                            // Add maxLength or word count validation logic if needed
                            required
                        />
                        <p className="mt-1 text-xs text-gray-500">Max 30 words</p>
                    </div>


                    {/* Slug */}
                    <div>
                        <label htmlFor="slug" className={`${labelStyles}`}>
                            Slug<span className="text-red-500">*</span>
                        </label>
                        <Input
                            type="text"
                            id="slug"
                            name="slug"
                            value={slug}
                            onChange={(e) => setSlug(e.target.value)}
                            placeholder="Enter slug here (e.g. my-article-title)"
                            className={inputStyles}
                            required
                        />
                    </div>

                    {/* Author name */}
                    <div>
                        <label htmlFor="authorName" className={`${labelStyles}`}>
                            Author Name<span className="text-red-500">*</span>
                        </label>
                        <Input
                            type="text"
                            id="authorName"
                            name="authorName"
                            value={authorName}
                            onChange={(e) => setAuthorName(e.target.value)}
                            placeholder="Enter author name here"
                            className={inputStyles}
                            required
                        />
                    </div>

                    {/* Sections */}
                    <div className="space-y-4 pt-4 border-t border-gray-200">
                        <div className="flex justify-between items-center">
                            <label className={`${labelStyles} mb-0`}>Content Sections<span className="text-red-500">*</span></label>
                            <Button type="button" onClick={addSection} size="sm" className={`${buttonStyles} bg-white`}>
                                <PlusCircle size={16} /> Add Section
                            </Button>
                        </div>
                         {sections.length === 0 && <p className='text-sm text-gray-500'>No content sections added yet. Add at least one.</p>}
                         {sections.map((sectionText, index) => (
                            <div key={index} className="space-y-2 relative p-4 rounded-lg border border-gray-200 bg-grey-1/40 shadow-sm">
                                <div className="flex justify-between items-start">
                                    <label htmlFor={`section-${index}`} className="block text-sm font-medium text-gray-700 mb-1">
                                        Description {index + 1}
                                    </label>
                                    {sections.length > 1 && ( // Only show remove if more than one section
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => removeSection(index)}
                                            className={`${removeButtonStyles} h-7 w-7 p-1`}
                                            aria-label={`Remove section ${index + 1}`}
                                        >
                                            <Trash2 size={14} />
                                        </Button>
                                    )}
                                </div>
                                <Textarea
                                    id={`section-${index}`}
                                    value={sectionText}
                                    onChange={(e) => updateSectionDescription(index, e.target.value)}
                                    placeholder={`Enter description for section ${index + 1}`}
                                    className={`${inputStyles} min-h-[120px] text-sm`}
                                    rows={5}
                                    required
                                />
                            </div>
                        ))}
                    </div>

                    {/* Save Button */}
                    <div className="flex justify-start pt-3">
                        <Button
                            type="submit"
                            disabled={isSubmitting}
                            className="bg-blueSky hover:bg-blueSky/90 text-white font-semibold py-3 px-8 rounded-md cursor-pointer transition-colors" // Darker save button
                        >
                            {isSubmitting ? "Adding..." : "Add"}
                        </Button>
                    </div>
                </form>
            </div>
        </main>
    );
};

export default ArticleFormPage;