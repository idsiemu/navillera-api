-- CreateTable
CREATE TABLE "sys_error" (
    "code" VARCHAR(16) NOT NULL,
    "lang" VARCHAR(8) NOT NULL DEFAULT E'kr',
    "status" INTEGER NOT NULL,
    "var" VARCHAR(32),
    "text" VARCHAR(64) NOT NULL,
    "remark" VARCHAR(64) NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6),

    CONSTRAINT "sys_error_pkey" PRIMARY KEY ("code","lang")
);

-- CreateTable
CREATE TABLE "sys_file" (
    "file_type" VARCHAR(32) NOT NULL,
    "pre_fix" VARCHAR(4) NOT NULL,
    "serial_no" INTEGER NOT NULL,
    "serial_digit" INTEGER NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sys_file_pkey" PRIMARY KEY ("file_type")
);

-- CreateTable
CREATE TABLE "news_category" (
    "idx" SERIAL NOT NULL,
    "title" VARCHAR(32) NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "news_category_pkey" PRIMARY KEY ("idx")
);

-- CreateTable
CREATE TABLE "news" (
    "idx" SERIAL NOT NULL,
    "category_idx" INTEGER NOT NULL,
    "title" VARCHAR(128) NOT NULL,
    "content" TEXT NOT NULL,
    "views" INTEGER NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6),

    CONSTRAINT "news_pkey" PRIMARY KEY ("idx")
);

-- CreateTable
CREATE TABLE "project_types" (
    "idx" SERIAL NOT NULL,
    "name" VARCHAR(64) NOT NULL,
    "href" VARCHAR(128) NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "project_types_pkey" PRIMARY KEY ("idx")
);

-- CreateTable
CREATE TABLE "projects" (
    "idx" SERIAL NOT NULL,
    "type_idx" INTEGER NOT NULL,
    "title" VARCHAR(64) NOT NULL,
    "sub_title" VARCHAR(64) NOT NULL,
    "when" VARCHAR(32) NOT NULL,
    "location" VARCHAR(32) NOT NULL,
    "organizer" VARCHAR(32) NOT NULL,
    "operate" VARCHAR(32),
    "support" VARCHAR(32),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6),

    CONSTRAINT "projects_pkey" PRIMARY KEY ("idx")
);

-- CreateTable
CREATE TABLE "project_images" (
    "idx" SERIAL NOT NULL,
    "project_idx" INTEGER NOT NULL,
    "bucket" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "hash" TEXT NOT NULL,
    "list_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6),

    CONSTRAINT "project_images_pkey" PRIMARY KEY ("idx")
);

-- CreateTable
CREATE TABLE "history_title" (
    "idx" SERIAL NOT NULL,
    "title" VARCHAR(32) NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6),

    CONSTRAINT "history_title_pkey" PRIMARY KEY ("idx")
);

-- CreateTable
CREATE TABLE "history" (
    "idx" SERIAL NOT NULL,
    "title_idx" INTEGER NOT NULL,
    "content" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6),

    CONSTRAINT "history_pkey" PRIMARY KEY ("idx")
);

-- CreateTable
CREATE TABLE "contact" (
    "idx" SERIAL NOT NULL,
    "organizer" VARCHAR(64) NOT NULL,
    "name" VARCHAR(32) NOT NULL,
    "tel" VARCHAR(32) NOT NULL,
    "email" VARCHAR(62) NOT NULL,
    "budget" VARCHAR(62) NOT NULL,
    "content" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "contact_pkey" PRIMARY KEY ("idx")
);

-- AddForeignKey
ALTER TABLE "news" ADD CONSTRAINT "news_category_idx_fkey" FOREIGN KEY ("category_idx") REFERENCES "news_category"("idx") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_type_idx_fkey" FOREIGN KEY ("type_idx") REFERENCES "project_types"("idx") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_images" ADD CONSTRAINT "project_images_project_idx_fkey" FOREIGN KEY ("project_idx") REFERENCES "projects"("idx") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "history" ADD CONSTRAINT "history_title_idx_fkey" FOREIGN KEY ("title_idx") REFERENCES "history_title"("idx") ON DELETE RESTRICT ON UPDATE CASCADE;
