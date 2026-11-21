export function checkPrimitiveRoleAlignment(
  filePath,
  fileName,
  content,
  toPascalCase,
  violation
) {
  const context = {
    violations: [],
    filePath,
    fileName,
    componentName: toPascalCase(fileName),
    content,
    violation,
  };
  checkToggleRole(context);
  checkFieldContentRole(context);
  checkFieldSetRole(context);
  checkFieldGroupRole(context);
  checkFieldRole(context);
  return context.violations;
}

function addViolation(context, suffix, primitive) {
  const { violations, filePath, fileName, componentName, violation } = context;
  violations.push(
    violation(
      filePath,
      "notes-app-primitive-role-alignment",
      `${fileName} (${componentName}) composes ${primitive} and should end with '${suffix}'.`
    )
  );
}

function checkToggleRole(context) {
  if (
    /<Toggle\b/.test(context.content) &&
    !context.componentName.endsWith("Toggle")
  ) {
    addViolation(context, "Toggle", "Toggle");
  }
}

function checkFieldContentRole(context) {
  const { content, fileName } = context;
  if (
    /<FieldContent\b/.test(content) &&
    /(-field-content\.tsx|-field-description\.tsx)/.test(fileName) &&
    !fileName.endsWith("-field-content.tsx")
  ) {
    addViolation(context, "FieldContent", "FieldContent");
  }
}

function checkFieldSetRole(context) {
  const { content, fileName, componentName } = context;
  const invalid =
    /<FieldSet\b/.test(content) &&
    fileName.includes("-field-") &&
    !fileName.endsWith("-field-set.tsx") &&
    !componentName.endsWith("Form") &&
    !componentName.endsWith("Card") &&
    !componentName.endsWith("Table") &&
    !componentName.endsWith("Figure");
  if (invalid) {
    addViolation(context, "FieldSet", "FieldSet");
  }
}

function checkFieldGroupRole(context) {
  const { content, fileName, componentName } = context;
  const allowedContainer =
    /<FieldSet\b/.test(content) &&
    (fileName.endsWith("-field-set.tsx") || componentName.endsWith("FieldSet"));
  const invalid =
    /<FieldGroup\b/.test(content) &&
    fileName.includes("-field-") &&
    !fileName.endsWith("-field-group.tsx") &&
    !componentName.endsWith("Form") &&
    !componentName.endsWith("Card") &&
    !componentName.endsWith("Group") &&
    !allowedContainer;
  if (invalid) {
    addViolation(context, "FieldGroup", "FieldGroup");
  }
}

function checkFieldRole(context) {
  const { content, fileName, componentName } = context;
  const excluded = [
    "-field.tsx",
    "-field-set.tsx",
    "-field-group.tsx",
    "-field-content.tsx",
  ].some((suffix) => fileName.endsWith(suffix));
  const allowedName = [
    "Input",
    "Form",
    "Card",
    "Header",
    "Description",
    "Item",
  ].some((suffix) => componentName.endsWith(suffix));
  const invalid =
    /<Field\b/.test(content) &&
    fileName.startsWith("question-") &&
    !excluded &&
    !allowedName;
  if (invalid) {
    addViolation(context, "Field", "Field");
  }
}
