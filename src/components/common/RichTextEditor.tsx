import { IconBold, IconItalic, IconUnderline, IconStrikethrough, IconH3, IconList, IconListNumbers, IconPolaroid } from '@tabler/icons-react';
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Image from '@tiptap/extension-image'
import Button from "./Button";
import ButtonGroup from "./ButtonGroup";

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
                allowBase64: true,
            }),
        ],
        content: value,
        editable: !readOnly,
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
    });

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
                                    variant={editor.isActive("bold") ? "primary" : "secondary"}
                                    onClick={() => editor.chain().focus().toggleBold().run()}
                                    size="xs"
                                    iconOnly
                                    icon={<IconBold stroke={1.5} size={18} />}
                                />
                            )}
                            {italic && (
                                <Button
                                    variant={editor.isActive("italic") ? "primary" : "secondary"}
                                    onClick={() => editor.chain().focus().toggleItalic().run()}
                                    size="xs"
                                    iconOnly
                                    icon={<IconItalic stroke={1.5} size={18} />}
                                />
                            )}
                            {underline && (
                                <Button
                                    variant={editor.isActive("underline") ? "primary" : "secondary"}
                                    onClick={() => editor.chain().focus().toggleUnderline().run()}
                                    size="xs"
                                    iconOnly
                                    icon={<IconUnderline stroke={1.5} size={18} />}
                                />
                            )}
                            {strike && (
                                <Button
                                    variant={editor.isActive("strike") ? "primary" : "secondary"}
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
                            variant={
                                editor.isActive("heading", { level: 3 })
                                    ? "primary"
                                    : "secondary"
                            }
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
                                    variant={
                                        editor.isActive("bulletList")
                                            ? "primary"
                                            : "secondary"
                                    }
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
                                    variant={
                                        editor.isActive("orderedList")
                                            ? "primary"
                                            : "secondary"
                                    }
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
                            variant={editor.isActive("image") ? "primary" : "secondary"}
                            onClick={() => {
                                const url = prompt("Image URL");
                                if (url) {
                                    editor.chain().focus().setImage({ src: url }).run();
                                }
                            }}
                            size="xs"
                            iconOnly
                            icon={<IconPolaroid stroke={1.5} size={18} />}
                        />
                    )}
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
        </div>
    );
};

export default RichTextEditor;
