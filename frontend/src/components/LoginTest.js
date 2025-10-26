import React from "react";
import Navbar from "./Navbar";
import { Button } from "./ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./Accordion";

function Login() {
  return (
    <>
      <Navbar></Navbar>
      <h1>Login/Logout ...</h1>
      <Button variant="destructive" size="lg">
        button test
      </Button>
      <Accordion type="single" collapsible>
        <AccordionItem value="item-1">
          <AccordionTrigger>Is it accessible?</AccordionTrigger>
          <AccordionContent>
            Yes. It adheres to the WAI-ARIA design pattern.
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </>
  );
}

export default Login;
