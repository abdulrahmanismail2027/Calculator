package edu.alexu.calculatorapi.controller;

import edu.alexu.calculatorapi.service.CalculatorService;
import org.springframework.web.bind.annotation.*;

@RestController
@CrossOrigin
@RequestMapping("/api")
public class CalculatorController {

    final CalculatorService calculatorService;

    public CalculatorController(CalculatorService calculatorService) {
        this.calculatorService = calculatorService;
    }

    @GetMapping("/add")
    public double add(@RequestParam double a, @RequestParam double b) {
        return calculatorService.add(a, b);
    }

    @GetMapping("/subtract")
    public double subtract(@RequestParam double a, @RequestParam double b) {
        return calculatorService.subtract(a, b);
    }

    @GetMapping("/times")
    public double times(@RequestParam double a, @RequestParam double b) {
        return calculatorService.times(a, b);
    }

    @GetMapping("/divide")
    public double divide(@RequestParam double a, @RequestParam double b) {
        return calculatorService.divide(a, b);
    }

    @GetMapping("/sqrt")
    public double sqrt(@RequestParam double a) {
        return calculatorService.sqrt(a);
    }

}
