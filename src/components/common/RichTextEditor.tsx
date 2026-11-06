import { useRef, useState } from "react";
import { IconBold, IconItalic, IconUnderline, IconStrikethrough, IconH3, IconList, IconListNumbers, IconPolaroid } from '@tabler/icons-react';
import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Image from '@tiptap/extension-image'
import Button from "./Button";
import ButtonGroup from "./ButtonGroup";
import MediaPickerModal from "./MediaPickerModal";
import { mediaService } from "../../services/mediaService";
import { getImageUrl } from "../../utils/getImageUrl";
import { getApiErrorMessage } from "../../utils/apiError";
import { validateMediaFile } from "../../utils/mediaValidation";
import { useAlert } from "../../contexts/alertContext";

interface ToolbarConfig {
    bold?: boolean;
    italic?: boolean;
    underline?: boolean;
    strike?: boolean;
    heading?: boolean;
    bulletList?: boolean;
    orderedList?: boolean;
    image?: boolean;
}

interface Props {
    value: string;
    onChange: (html: string) => void;
    readOnly?: boolean;
    toolbar?: ToolbarConfig;
}

const RichTextEditor: React.FC<Props> = ({ value, onChange, readOnly, toolbar }) => {

    const [showMediaPicker, setShowMediaPicker] = useState(false);
    const [uploadingCount, setUploadingCount] = useState(0);
    const { setAlert } = useAlert();

    // The backend sanitizer drops `data:` URLs (guide §8.2), so pasted/dropped images are
    // uploaded to the media library and inserted by URL instead of being embedded as base64.
    const editorRef = useRef<Editor | null>(null);
    const uploadImagesRef = useRef<(files: File[], pos?: number) => Promise<void>>(async () => {});
    uploadImagesRef.current = async (files, pos) => {
        let insertAt = pos;
        for (const file of files) {
            const invalid = validateMediaFile(file, { imagesOnly: true });
            if (invalid) {
                setAlert({ type: "error", message: invalid });
                continue;
            }
            setUploadingCount((c) => c + 1);
            try {
                const created = await mediaService.upload(file);
                const node = {
                    type: "image",
                    attrs: { src: getImageUrl(created.url), alt: created.alt_text ?? file.name },
                };
                const chain = editorRef.current?.chain().focus();
                if (!chain) return;
                if (insertAt !== undefined) chain.insertContentAt(insertAt, node).run();
                else chain.insertContent(node).run();
                insertAt = undefined; // later files go at the caret
            } catch (err: any) {
                setAlert({ type: "error", message: getApiErrorMessage(err, "Failed to upload image.") });
            } finally {
                setUploadingCount((c) => c - 1);
            }
        }
    };

    const imageFilesFrom = (list?: FileList | null) =>
        Array.from(list ?? []).filter((f) => f.type.startsWith("image/"));

    /* ----------------------------------------
       Toolbar defaults
    ---------------------------------------- */
    const {
        bold = true,
        italic = true,
        underline = true,
        strike = true,
        heading = true,
        bulletList = true,
        orderedList = true,
        image = true,
    } = toolbar || {};

    const editor = useEditor({
        extensions: [
            StarterKit,
            Underline,
            Image.configure({
                inline: false,
                allowBase64: false,
            }),
        ],
        content: value,
        editable: !readOnly,
        editorProps: {
            handlePaste: (_view, event) => {
                const files = imageFilesFrom(event.clipboardData?.files);
                if (files.length === 0) return false; // let TipTap handle text/HTML paste
                event.preventDefault();
                void uploadImagesRef.current(files);
                return true;
            },
            handleDrop: (view, event, _slice, moved) => {
                if (moved) return false; // dragging nodes inside the editor
                const files = imageFilesFrom(event.dataTransfer?.files);
                if (files.length === 0) return false;
                event.preventDefault();
                const pos = view.posAtCoords({ left: event.clientX, top: event.clientY })?.pos;
                void uploadImagesRef.current(files, pos);
                return true;
            },
        },
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
    });

    editorRef.current = editor;

    if (!editor) return null;

    return (
        <div className="w-full bg-transparent dark:bg-gray-800 dark:text-gray-100 placeholder:text-slate-400 dark:placeholder:text-gray-500 text-slate-700 border border-slate-200 dark:border-gray-700 rounded-md transition duration-300 ease focus:outline-none focus:border-slate-400 dark:focus:border-gray-500 hover:border-slate-300 dark:hover:border-gray-600 shadow-sm focus:shadow sm:text-sm">
            {/* ----------------------------------------
                Toolbar
            ---------------------------------------- */}
            {!readOnly && (
                <div className="flex flex-wrap gap-1 border-b border-slate-200 dark:border-gray-700 p-2">
                    {(bold || italic || underline || strike) && (
                        <ButtonGroup>
                            {bold && (
                                <Button
                                    variant="outline"
                                    className={editor.isActive('bold')
                                        ? 'text-orange-600 bg-orange-50 dark:bg-orange-900/20'
                                        : 'text-gray-500'}
                                    onClick={() => editor.chain().focus().toggleBold().run()}
                                    size="xs"
                                    iconOnly
                                    icon={<IconBold stroke={1.5} size={18} />}
                                />
                            )}
                            {italic && (
                                <Button
                                    variant="outline"
                                    className={editor.isActive('italic')
                                        ? 'text-orange-600 bg-orange-50 dark:bg-orange-900/20'
                                        : 'text-gray-500'}
                                    onClick={() => editor.chain().focus().toggleItalic().run()}
                                    size="xs"
                                    iconOnly
                                    icon={<IconItalic stroke={1.5} size={18} />}
                                />
                            )}
                            {underline && (
                                <Button
                                    variant="outline"
                                    className={editor.isActive('underline')
                                        ? 'text-orange-600 bg-orange-50 dark:bg-orange-900/20'
                                        : 'text-gray-500'}
                                    onClick={() => editor.chain().focus().toggleUnderline().run()}
                                    size="xs"
                                    iconOnly
                                    icon={<IconUnderline stroke={1.5} size={18} />}
                                />
                            )}
                            {strike && (
                                <Button
                                    variant="outline"
                                    className={editor.isActive('strike')
                                        ? 'text-orange-600 bg-orange-50 dark:bg-orange-900/20'
                                        : 'text-gray-500'}
                                    onClick={() => editor.chain().focus().toggleStrike().run()}
                                    size="xs"
                                    iconOnly
                                    icon={<IconStrikethrough stroke={1.5} size={18} />}
                                />
                            )}
                        </ButtonGroup>
                    )}

                    {heading && (
                        <Button
                            variant="outline"
                            className={editor.isActive("heading", { level: 3 })
                                ? 'text-orange-600 bg-orange-50 dark:bg-orange-900/20'
                                : 'text-gray-500'}
                            onClick={() =>
                                editor.chain().focus().toggleHeading({ level: 3 }).run()
                            }
                            size="xs"
                            iconOnly
                            icon={<IconH3 stroke={1.5} size={18} />}
                            rounded="md"
                        />
                    )}

                    {(bulletList || orderedList) && (
                        <ButtonGroup>
                            {bulletList && (
                                <Button
                                    variant="outline"
                                    className={editor.isActive("bulletList")
                                        ? 'text-orange-600 bg-orange-50 dark:bg-orange-900/20'
                                        : 'text-gray-500'}
                                    onClick={() =>
                                        editor.chain().focus().toggleBulletList().run()
                                    }
                                    size="xs"
                                    iconOnly
                                    icon={<IconList stroke={1.5} size={18} />}
                                />
                            )}
                            {orderedList && (
                                <Button
                                    variant="outline"
                                    className={editor.isActive("orderedList")
                                        ? 'text-orange-600 bg-orange-50 dark:bg-orange-900/20'
                                        : 'text-gray-500'}
                                    onClick={() =>
                                        editor.chain().focus().toggleOrderedList().run()
                                    }
                                    size="xs"
                                    iconOnly
                                    icon={<IconListNumbers stroke={1.5} size={18} />}
                                />
                            )}
                        </ButtonGroup>
                    )}

                    {image && (
                        <Button
                            variant="outline"
                            className={editor.isActive("image")
                                ? 'text-orange-600 bg-orange-50 dark:bg-orange-900/20'
                                : 'text-gray-500'}
                            onClick={() => setShowMediaPicker(true)}
                            size="xs"
                            iconOnly
                            icon={<IconPolaroid stroke={1.5} size={18} />}
                            rounded="lg"
                        />
                    )}
                </div>
            )}

            {uploadingCount > 0 && (
                <div className="px-3 py-1 text-xs text-gray-500 dark:text-gray-400">
                    Uploading image…
                </div>
            )}

            {/* Editor */}
            <EditorContent
                editor={editor}
                className="
                    p-3 min-h-[150px] 
                    prose dark:prose-invert max-w-none
                    [&_.ProseMirror]:outline-none
                    [&_.ProseMirror]:min-h-[120px]
                    [&_.ProseMirror:focus]:outline-none
                "
            />

            <MediaPickerModal
                isOpen={showMediaPicker}
                onClose={() => setShowMediaPicker(false)}
                onSelect={(url) => {
                    editor.chain().focus().setImage({ src: url }).run();
                }}
            />
        </div>
    );
};

export default RichTextEditor;
