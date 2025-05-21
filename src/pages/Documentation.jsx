import React from "react";
import Content from "../Document/Content.json";

const Documentation = () => {
  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <div className="w-1/4 bg-gray-100 dark:bg-gray-900 p-6 border-r sticky top-0 h-screen overflow-y-auto">
        <h5 className="text-slate-900 font-semibold mb-4 text-sm leading-6 dark:text-slate-100">
          On this page
        </h5>
        <ul className="text-slate-700 text-sm leading-6 dark:text-slate-400">
          {Content.sections.map((section) => (
            <li key={section.id}>
              <a
                href={`#${section.id}`}
                className="block py-1 font-medium hover:text-slate-900 dark:hover:text-slate-300">
                {section.title}
              </a>
            </li>
          ))}
        </ul>
      </div>

      {/* Main Content */}
      <div className="w-3/4 p-12 dark:bg-gray-800">
        {Content.sections.map((section) => (
          <section key={section.id} id={section.id} className="mt-8">
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
              {section.title}
            </h2>
            <p className="mt-4 text-slate-700 dark:text-slate-400">
              {section.description}
            </p>
            <ul className="mt-4 list-disc pl-5 space-y-2 text-slate-700 dark:text-slate-400">
              {section.steps.map((step, index) => (
                <li key={index}>{step}</li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
};

export default Documentation;